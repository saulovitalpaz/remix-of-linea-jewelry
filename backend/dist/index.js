import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { uploadToCloudinary } from './utils/cloudinary.js';
dotenv.config();
// === PROCESS DEATH DIAGNOSTICS ===
process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('[FATAL] Unhandled Rejection:', reason);
});
process.on('exit', (code) => {
    console.error(`[DEATH] Process exiting with code: ${code}`);
});
process.on('SIGTERM', () => {
    console.error('[DEATH] Received SIGTERM');
});
process.on('SIGINT', () => {
    console.error('[DEATH] Received SIGINT');
});
process.on('SIGUSR2', () => {
    console.error('[DEATH] Received SIGUSR2');
});
// Keepalive: prevent Node from exiting due to empty event loop
const keepalive = setInterval(() => {
    // Silent keepalive - just keeps the process running
}, 30000);
const app = express();
const prisma = new PrismaClient();
const upload = multer();
const port = parseInt(process.env.PORT || '3001', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'chiquedetalhes.com.br',
        'up.railway.app',
        'localhost'
    ];
    if (origin) {
        const isAllowed = allowedOrigins.some(ao => origin.includes(ao));
        if (isAllowed) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
    }
    else {
        // Fallback for requests without Origin header (like some health checks)
        res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});
app.use(express.json());
// --- Authentication Middleware ---
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminId = decoded.id;
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (admin && await bcrypt.compare(password, admin.passwordHash)) {
            const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '1d' });
            res.json({ token });
        }
        else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// --- Category Routes ---
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await prisma.category.findMany();
        res.json(categories);
    }
    catch (err) {
        console.error('Categories error:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});
app.post('/api/categories', authenticateAdmin, async (req, res) => {
    const { name, slug, description, emoji } = req.body;
    try {
        const category = await prisma.category.create({
            data: { name, slug, description, emoji }
        });
        res.status(201).json(category);
    }
    catch (err) {
        res.status(400).json({ error: 'Category creation failed' });
    }
});
// --- Product Routes ---
app.get('/api/products', async (req, res) => {
    try {
        const categorySlug = req.query.categorySlug;
        const products = await prisma.product.findMany({
            where: categorySlug ? { category: { slug: categorySlug } } : {},
            include: { category: true }
        });
        res.json(products);
    }
    catch (err) {
        console.error('Products error:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
app.post('/api/products', authenticateAdmin, upload.single('image'), async (req, res) => {
    const { name, price, description, categoryId, stock } = req.body;
    const file = req.file;
    try {
        let imageUrl = '';
        if (file) {
            imageUrl = await uploadToCloudinary(file.buffer);
        }
        // Try to find category by slug if categoryId is not a UUID
        let actualCategoryId = categoryId;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
        if (!isUUID) {
            const category = await prisma.category.findUnique({
                where: { slug: categoryId }
            });
            if (category) {
                actualCategoryId = category.id;
            }
            else {
                return res.status(400).json({ error: 'Invalid category' });
            }
        }
        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                description,
                imageUrl,
                stock: stock ? parseInt(stock, 10) : 0,
                categoryId: actualCategoryId
            }
        });
        res.status(201).json(product);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Product creation failed' });
    }
});
// Update Product (including stock)
app.put('/api/products/:id', authenticateAdmin, upload.single('image'), async (req, res) => {
    const { name, price, description, categoryId, stock } = req.body;
    const file = req.file;
    try {
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (price !== undefined)
            updateData.price = parseFloat(price);
        if (description !== undefined)
            updateData.description = description;
        if (stock !== undefined)
            updateData.stock = parseInt(stock, 10);
        if (categoryId !== undefined)
            updateData.categoryId = categoryId;
        if (file) {
            updateData.imageUrl = await uploadToCloudinary(file.buffer);
        }
        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(product);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Product update failed' });
    }
});
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { category: true }
        });
        if (!product)
            return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    }
    catch (err) {
        console.error('Product detail error:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Chique Detalhes API is running' });
});
// --- Daily Sales / Caixas Routes ---
app.post('/api/sales/close-day', authenticateAdmin, async (req, res) => {
    const { itemsSoldData, notes } = req.body; // Array of { productId, quantity, priceAtSale }
    try {
        // Run as a transaction to ensure all stock is updated or none
        const result = await prisma.$transaction(async (tx) => {
            let totalRevenue = 0;
            let totalItemsSold = 0;
            for (const item of itemsSoldData) {
                // Update product stock and sales count
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: { decrement: item.quantity },
                        salesCount: { increment: item.quantity }
                    }
                });
                totalRevenue += (item.priceAtSale * item.quantity);
                totalItemsSold += item.quantity;
            }
            // Create daily sales record
            const dailySales = await tx.dailySales.create({
                data: {
                    totalRevenue,
                    itemsSold: totalItemsSold,
                    notes
                }
            });
            return dailySales;
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error closing day:", error);
        res.status(500).json({ error: 'Failed to process daily sales.' });
    }
});
// --- Marketing Popup Routes ---
app.get('/api/popup/active', async (req, res) => {
    try {
        const popup = await prisma.marketingPopup.findFirst({
            where: { active: true },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(popup || null);
    }
    catch (err) {
        console.error('Popup error:', err);
        res.status(500).json({ error: 'Failed to fetch popup' });
    }
});
app.get('/api/popup', authenticateAdmin, async (req, res) => {
    try {
        const popups = await prisma.marketingPopup.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(popups);
    }
    catch (err) {
        console.error('Popup list error:', err);
        res.status(500).json({ error: 'Failed to fetch popups' });
    }
});
app.post('/api/popup', authenticateAdmin, upload.single('image'), async (req, res) => {
    const file = req.file;
    if (!file)
        return res.status(400).json({ error: 'Image is required' });
    try {
        const imageUrl = await uploadToCloudinary(file.buffer);
        // Deactivate all others first
        await prisma.marketingPopup.updateMany({ data: { active: false } });
        const popup = await prisma.marketingPopup.create({
            data: { imageUrl, active: true }
        });
        res.status(201).json(popup);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to create popup' });
    }
});
app.put('/api/popup/:id/toggle', authenticateAdmin, async (req, res) => {
    try {
        const { active } = req.body;
        if (active) {
            // If activating this one, deactivate all others first
            await prisma.marketingPopup.updateMany({ data: { active: false } });
        }
        const popup = await prisma.marketingPopup.update({
            where: { id: req.params.id },
            data: { active }
        });
        res.json(popup);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to toggle popup' });
    }
});
app.delete('/api/popup/:id', authenticateAdmin, async (req, res) => {
    try {
        await prisma.marketingPopup.delete({ where: { id: req.params.id } });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete popup' });
    }
});
// --- Seed Admin ---
async function seedAdmin() {
    const email = 'barbara@chiquedetalhes.com.br';
    try {
        const existing = await prisma.adminUser.findUnique({ where: { email } });
        if (!existing) {
            const passwordHash = await bcrypt.hash('Beijinho2023', 10);
            await prisma.adminUser.create({
                data: { email, passwordHash }
            });
            console.log('Admin user Bárbara Paz seeded successfully.');
        }
    }
    catch (e) {
        console.error('Error seeding admin user:', e);
    }
}
// Health check route (required by Railway to detect the server is up)
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Start server FIRST, then seed admin in background
const server = app.listen(port, '::', () => {
    const address = server.address();
    const bindInfo = typeof address === 'string' ? address : `${address?.address}:${address?.port}`;
    console.log(`[BOOT] Chique Detalhes API natively listening on ${bindInfo} (Dual Stack)`);
    console.log(`[BOOT] Environment: ${process.env.NODE_ENV || 'development'}`);
    // Run seed in background after server is confirmed UP
    seedAdmin()
        .then(() => console.log('[BOOT] Seed check completed.'))
        .catch(err => console.error('[BOOT] Seed failed:', err));
});
server.on('error', (err) => {
    console.error('[SERVER] Server error:', err);
});
server.on('close', () => {
    console.error('[SERVER] Server closed!');
});
//# sourceMappingURL=index.js.map
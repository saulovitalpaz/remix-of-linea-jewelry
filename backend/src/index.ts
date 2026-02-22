import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { uploadToCloudinary } from './utils/cloudinary.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const upload = multer();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

app.use(cors());
app.use(express.json());

// --- Authentication Middleware ---
const authenticateAdmin = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.adminId = (decoded as any).id;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const admin = await prisma.adminUser.findUnique({ where: { email } });

    if (admin && await bcrypt.compare(password, admin.passwordHash)) {
        const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// --- Category Routes ---
app.get('/api/categories', async (req, res) => {
    const categories = await prisma.category.findMany();
    res.json(categories);
});

app.post('/api/categories', authenticateAdmin, async (req, res) => {
    const { name, slug, description, emoji } = req.body;
    try {
        const category = await prisma.category.create({
            data: { name, slug, description, emoji }
        });
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ error: 'Category creation failed' });
    }
});

// --- Product Routes ---
app.get('/api/products', async (req, res) => {
    const { categorySlug } = req.query;
    const products = await prisma.product.findMany({
        where: categorySlug ? { category: { slug: categorySlug as string } } : {},
        include: { category: true }
    });
    res.json(products);
});

app.post('/api/products', authenticateAdmin, upload.single('image'), async (req, res) => {
    const { name, price, description, categoryId } = req.body;
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
            } else {
                return res.status(400).json({ error: 'Invalid category' });
            }
        }

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                description,
                imageUrl,
                categoryId: actualCategoryId
            }
        });
        res.status(201).json(product);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Product creation failed' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    const product = await prisma.product.findUnique({
        where: { id: req.params.id },
        include: { category: true }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Chique Detalhes API is running' });
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
    } catch (e) {
        console.error('Error seeding admin user:', e);
    }
}

seedAdmin().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});

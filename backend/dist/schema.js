import { readFile } from 'node:fs/promises';
export async function upgradeCashFlow(prisma) {
    await executeUpgrade(prisma, new URL('../prisma/upgrades/20260921_cash_flow.sql', import.meta.url));
}
async function executeUpgrade(prisma, url) {
    // Checked-in upgrades contain simple DDL only, with no procedural SQL.
    const sql = await readFile(url, 'utf8');
    const statements = sql.replace(/--[^\r\n]*/g, '').split(';').map(statement => statement.trim())
        .filter(statement => statement && statement !== 'BEGIN' && statement !== 'COMMIT');
    await prisma.$transaction(async (tx) => {
        for (const statement of statements)
            await tx.$executeRawUnsafe(statement);
    });
}
export async function upgradeSalesPortal(prisma) {
    await executeUpgrade(prisma, new URL('../prisma/upgrades/20260921_sales_portal.sql', import.meta.url));
}
//# sourceMappingURL=schema.js.map
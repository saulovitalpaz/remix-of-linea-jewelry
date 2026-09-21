import { readFile } from 'node:fs/promises';
export async function upgradeCashFlow(prisma) {
    const sql = await readFile(new URL('../prisma/upgrades/20260921_cash_flow.sql', import.meta.url), 'utf8');
    // This checked-in upgrade contains only simple DDL, with no procedural SQL.
    const statements = sql.replace(/--[^\r\n]*/g, '').split(';').map(statement => statement.trim())
        .filter(statement => statement && statement !== 'BEGIN' && statement !== 'COMMIT');
    await prisma.$transaction(async (tx) => {
        for (const statement of statements)
            await tx.$executeRawUnsafe(statement);
    });
}
//# sourceMappingURL=schema.js.map
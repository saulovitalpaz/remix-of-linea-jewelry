interface SchemaDatabase {
    $transaction: (run: (tx: {
        $executeRawUnsafe: (sql: string) => Promise<number>;
    }) => Promise<void>) => Promise<void>;
}
export declare function upgradeCashFlow(prisma: SchemaDatabase): Promise<void>;
export declare function upgradeSalesPortal(prisma: SchemaDatabase): Promise<void>;
export {};
//# sourceMappingURL=schema.d.ts.map
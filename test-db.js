const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const dailyBooks = await prisma.dailyBook.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { items: true }
    });
    console.log("Daily Books:", JSON.stringify(dailyBooks, null, 2));

    const ledgers = await prisma.ledger.findMany({
        where: { type: 'PRODUCT' },
        take: 5,
        orderBy: { created_at: 'desc' }
    });
    console.log("Ledgers:", JSON.stringify(ledgers, null, 2));

    // Let's test the raw query too
    const rawQuery = await prisma.$queryRaw`
        SELECT TO_CHAR(db.date, 'YYYY-MM-DD') as date, dbi.kg, dbi.note,
        (
            SELECT 1 FROM "Ledger" l 
            WHERE l.customer_id = dbi.customer_id 
            AND l.reference_date = db.date 
            AND l.type = 'PRODUCT' 
            AND l.deleted_at IS NULL
        ) as has_ledger
        FROM "DailyBookItem" dbi
        JOIN "DailyBook" db ON dbi.daily_book_id = db.id
        ORDER BY db.date DESC
        LIMIT 10;
    `;
    console.log("Raw Query:", JSON.stringify(rawQuery, null, 2));
}

main().finally(() => prisma.$disconnect());

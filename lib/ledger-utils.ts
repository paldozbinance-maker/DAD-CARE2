import pool from '@/lib/db';

/**
 * Recalculates the running debt for a customer's ledger from a specific point in time forward.
 * We fetch all active ledgers for the customer, ordered by created_at ASC, and recalculate
 * previous_debt and new_debt.
 */
export async function recalculateCustomerLedger(customerId: string, client: any = pool) {
    // We lock the customer rows if this is inside a transaction, but let's assume
    // client could be a transaction client or the main pool.
    
    // Fetch all undeleted entries in chronological order
    const { rows: entries } = await client.query(
        `SELECT id, type, amount FROM "Ledger" 
         WHERE customer_id = $1 AND deleted_at IS NULL
         ORDER BY created_at ASC, id ASC
         FOR UPDATE`, // Lock rows to prevent race conditions during recalculation
        [customerId]
    );

    let runningDebt = 0;

    for (const entry of entries) {
        const previousDebt = runningDebt;
        
        let newDebt = runningDebt;
        const amount = Math.round(parseFloat(entry.amount));

        if (entry.type === 'PAYMENT') {
            newDebt = Math.round(previousDebt - amount);
        } else if (entry.type === 'PRODUCT') {
            newDebt = Math.round(previousDebt + amount);
        } else if (entry.type === 'ADJUSTMENT') {
            newDebt = Math.round(previousDebt + amount); // Assuming positive adjustment adds to debt, negative reduces
        }

        runningDebt = newDebt;

        // Only update if it actually changed to save DB writes
        await client.query(
            `UPDATE "Ledger" 
             SET previous_debt = $1, new_debt = $2 
             WHERE id = $3`,
            [previousDebt, newDebt, entry.id]
        );
    }

    return runningDebt;
}

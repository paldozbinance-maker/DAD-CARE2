import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import { logAudit } from '@/lib/audit';
import { requireSuperAdmin } from '@/lib/require-session';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request) {
    // 1. Verify Super Admin session
    const { errorResponse, session } = await requireSuperAdmin(request);
    if (errorResponse) return errorResponse;

    try {
        // 2. Soft-delete all records from "Ledger" table using pg pool
        const result = await pool.query(
            'UPDATE "Ledger" SET deleted_at = NOW(), deleted_by = $1 WHERE deleted_at IS NULL',
            [session?.username || 'unknown']
        );

        // 3. Log this action to the Audit Trail
        await logAudit(
            request,
            'CLEAR_ALL_LEDGER_HISTORY',
            `Soft-cleared all customer ledger history (${result.rowCount || 0} entries) by Super Admin ${session.username}`
        );

        // 4. Revalidate cache tags for customers to update frontend balance aggregates
        try {
            revalidateTag('customers', 'max');
        } catch (cacheErr) {
            console.error('Failed to revalidate customers tag:', cacheErr);
        }

        return NextResponse.json({
            success: true,
            deletedCount: result.rowCount || 0
        });
    } catch (error: any) {
        console.error('Clear All Ledger History Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to clear history' },
            { status: 500 }
        );
    }
}


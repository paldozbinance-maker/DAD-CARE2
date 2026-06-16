import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const usernamesToDelete = ['c', 'ci'];
        
        const deleteQueries = [
            `DELETE FROM "AdminSession" WHERE username = ANY($1)`,
            `DELETE FROM "AuditLog" WHERE username = ANY($1)`,
            `DELETE FROM "User" WHERE username = ANY($1)`
        ];
        
        let deletedSessions = 0;
        let deletedAuditLogs = 0;
        let deletedUsers = 0;
        
        const res1 = await pool.query(deleteQueries[0], [usernamesToDelete]);
        deletedSessions = res1.rowCount || 0;
        
        const res2 = await pool.query(deleteQueries[1], [usernamesToDelete]);
        deletedAuditLogs = res2.rowCount || 0;
        
        const res3 = await pool.query(deleteQueries[2], [usernamesToDelete]);
        deletedUsers = res3.rowCount || 0;
        
        return NextResponse.json({ 
            success: true, 
            deletedSessions, 
            deletedAuditLogs, 
            deletedUsers 
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

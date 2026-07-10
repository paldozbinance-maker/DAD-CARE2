import { NextResponse } from 'next/server';
import { getAllSessions } from '@/lib/sessions-store';

export const GET = async () => {
    try {
        const all = await getAllSessions();
        return NextResponse.json({
            count: all.length,
            totalSize: JSON.stringify(all).length,
            sample: all.slice(0, 2)
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};

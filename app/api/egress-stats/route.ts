import { NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/require-session';
import { getEgressStats, resetEgressStats } from '@/lib/egress-tracker';

/**
 * GET /api/egress-stats — Returns full ranked egress breakdown.
 * Only accessible to SUPER_ADMIN.
 *
 * Query params:
 *   ?format=text  — Returns plain text summary (for terminal/curl)
 *   ?reset=true   — Resets all stats after returning them
 */
export async function GET(request: Request) {
    const { errorResponse } = await requireSuperAdmin(request);
    if (errorResponse) return errorResponse;

    const stats = getEgressStats();
    const { searchParams } = new URL(request.url);

    if (searchParams.get('reset') === 'true') {
        resetEgressStats();
    }

    if (searchParams.get('format') === 'text') {
        const lines: string[] = [];
        lines.push('═══════════════════════════════════════════════════════════════════');
        lines.push('  EGRESS TRACKER — LIVE BANDWIDTH REPORT');
        lines.push('═══════════════════════════════════════════════════════════════════');
        lines.push(`  Tracking since:  ${stats.startedAt}`);
        lines.push(`  Uptime:          ${Math.round(stats.uptimeSeconds / 60)} minutes`);
        lines.push(`  Total requests:  ${stats.totalRequests}`);
        lines.push(`  Total egress:    ${stats.totalEgressFormatted}`);
        lines.push('═══════════════════════════════════════════════════════════════════');
        lines.push('');

        if (stats.routes.length === 0) {
            lines.push('  No API requests recorded yet. Use the app and come back.');
        }

        for (const r of stats.routes) {
            lines.push(`  #${r.rank} ${r.route}`);
            lines.push(`     ${r.percentOfTotal} of total egress`);
            lines.push(`     Requests:       ${r.totalRequests}`);
            lines.push(`     Total bytes:    ${r.totalBytesFormatted}`);
            lines.push(`     Avg response:   ${r.avgBytesFormatted}`);
            lines.push(`     Largest:        ${r.largestFormatted}`);
            lines.push(`     Avg time:       ${r.avgTimeMs}ms`);
            lines.push(`     Slowest:        ${r.slowestMs}ms`);
            lines.push(`     Last called:    ${r.lastCalledAt}`);
            lines.push('  ─────────────────────────────────────────────────────────');
        }

        if (searchParams.get('reset') === 'true') {
            lines.push('');
            lines.push('  ⚠️  Stats have been RESET.');
        }

        return new Response(lines.join('\n'), {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }

    const response = NextResponse.json(stats);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
}

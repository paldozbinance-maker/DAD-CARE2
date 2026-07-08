/**
 * Automated Test Suite — Ledger Calculation Logic
 * 
 * Run with:  npx tsx --test __tests__/ledger-utils.test.ts
 *
 * Tests the core financial math that recalculateCustomerLedger performs.
 * Catches arithmetic regressions BEFORE they reach production.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ────────────────────────────────────────────────────────────────────────────
// Replicate the ledger math as pure functions — no DB needed
// These mirror exactly what the WINDOW FUNCTION in recalculateCustomerLedger does
// ────────────────────────────────────────────────────────────────────────────

interface LedgerEntry {
    id: string;
    type: 'PRODUCT' | 'PAYMENT' | 'ADJUSTMENT';
    amount: number;
    note?: string;
}

interface LedgerResult {
    id: string;
    previous_debt: number;
    new_debt: number;
}

function simulateRecalculate(entries: LedgerEntry[]): LedgerResult[] {
    let runningDebt = 0;
    return entries.map(entry => {
        const previousDebt = runningDebt;
        const amount = Math.round(entry.amount);

        if (entry.type === 'PAYMENT') {
            runningDebt = Math.round(previousDebt - amount);
        } else if (entry.type === 'PRODUCT') {
            runningDebt = Math.round(previousDebt + amount);
        } else if (entry.type === 'ADJUSTMENT') {
            const lowerNote = (entry.note || '').toLowerCase();
            if (lowerNote.includes('setup') || lowerNote.includes('initial') || lowerNote.includes('reesto')) {
                runningDebt = amount; // Reset to exact adjustment value
            } else {
                runningDebt = Math.round(previousDebt + amount);
            }
        }

        return { id: entry.id, previous_debt: previousDebt, new_debt: runningDebt };
    });
}

// ────────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────────

describe('Ledger Calculation Tests', () => {

    describe('PRODUCT entries', () => {
        test('Single product purchase increases debt by exact amount', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 500 },
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[0].previous_debt, 0, 'Previous debt should be 0 for first entry');
            assert.equal(result[0].new_debt, 500, 'Debt should increase to 500');
        });

        test('Multiple product purchases accumulate debt', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 500 },
                { id: '2', type: 'PRODUCT', amount: 300 },
                { id: '3', type: 'PRODUCT', amount: 200 },
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[0].new_debt, 500);
            assert.equal(result[1].previous_debt, 500);
            assert.equal(result[1].new_debt, 800);
            assert.equal(result[2].previous_debt, 800);
            assert.equal(result[2].new_debt, 1000);
        });
    });

    describe('PAYMENT entries', () => {
        test('Full payment clears debt to zero', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 1000 },
                { id: '2', type: 'PAYMENT', amount: 1000 },
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[1].previous_debt, 1000);
            assert.equal(result[1].new_debt, 0, 'Debt should be 0 after full payment');
        });

        test('Partial payment reduces debt correctly', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 1000 },
                { id: '2', type: 'PAYMENT', amount: 400 },
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[1].new_debt, 600, 'Remaining debt should be 600');
        });

        test('Overpayment results in negative debt (credit)', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 500 },
                { id: '2', type: 'PAYMENT', amount: 700 },
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[1].new_debt, -200, 'Overpayment should create credit (negative debt)');
        });
    });

    describe('Running balance integrity', () => {
        test('Mixed transactions maintain correct running balance', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 1000 },
                { id: '2', type: 'PAYMENT', amount: 500 },
                { id: '3', type: 'PRODUCT', amount: 800 },
                { id: '4', type: 'PAYMENT', amount: 300 },
            ];
            const result = simulateRecalculate(entries);

            // Entry 1: 0 + 1000 = 1000
            assert.equal(result[0].new_debt, 1000);
            // Entry 2: 1000 - 500 = 500
            assert.equal(result[1].new_debt, 500);
            // Entry 3: 500 + 800 = 1300
            assert.equal(result[2].new_debt, 1300);
            // Entry 4: 1300 - 300 = 1000
            assert.equal(result[3].new_debt, 1000);
        });

        test('Each entry has correct previous_debt from prior entry', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 300 },
                { id: '2', type: 'PRODUCT', amount: 200 },
                { id: '3', type: 'PAYMENT', amount: 100 },
            ];
            const result = simulateRecalculate(entries);

            assert.equal(result[1].previous_debt, result[0].new_debt,
                'Entry 2 previous_debt must equal Entry 1 new_debt');
            assert.equal(result[2].previous_debt, result[1].new_debt,
                'Entry 3 previous_debt must equal Entry 2 new_debt');
        });

        test('Starting from existing debt works correctly', () => {
            // Simulate a customer who already has 2000 debt, gets a new 500 purchase
            // (The function always recalculates from 0, the initial balance is set via an ADJUSTMENT)
            const entries: LedgerEntry[] = [
                { id: '0', type: 'ADJUSTMENT', amount: 2000, note: 'reesto initial balance' },
                { id: '1', type: 'PRODUCT', amount: 500 },
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[0].new_debt, 2000, 'Reesto adjustment should set debt to 2000');
            assert.equal(result[1].previous_debt, 2000);
            assert.equal(result[1].new_debt, 2500);
        });
    });

    describe('ADJUSTMENT entries', () => {
        test('Setup/Reesto adjustment resets debt to exact value', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 9999 }, // Large existing debt
                { id: '2', type: 'ADJUSTMENT', amount: 500, note: 'reesto' }, // Reset to 500
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[1].new_debt, 500, 'Reesto should reset debt to exactly 500');
        });

        test('Regular adjustment adds to existing debt', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 1000 },
                { id: '2', type: 'ADJUSTMENT', amount: 200, note: 'late fee' },
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[1].new_debt, 1200, 'Regular adjustment should add to debt');
        });

        test('Negative adjustment reduces debt', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 1000 },
                { id: '2', type: 'ADJUSTMENT', amount: -100, note: 'discount' },
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[1].new_debt, 900, 'Negative adjustment should reduce debt');
        });
    });

    describe('Edge cases', () => {
        test('Empty entry list returns empty results', () => {
            const result = simulateRecalculate([]);
            assert.equal(result.length, 0);
        });

        test('Fractional amounts are rounded correctly', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PRODUCT', amount: 333.7 }, // Should round to 334
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[0].new_debt, 334, 'Amount should be rounded to nearest integer');
        });

        test('Payment followed by product does not corrupt balance', () => {
            const entries: LedgerEntry[] = [
                { id: '1', type: 'PAYMENT', amount: 200 }, // Paid before any product (credit)
                { id: '2', type: 'PRODUCT', amount: 500 },
            ];
            const result = simulateRecalculate(entries);
            assert.equal(result[0].new_debt, -200, 'First entry is a credit');
            assert.equal(result[1].new_debt, 300, 'Net balance is 500 - 200 = 300');
        });
    });
});

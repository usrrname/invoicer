import assert from 'node:assert';
import { describe, test } from 'node:test';
import { calculateAndValidateTotals } from '../src/totalsCalculator.mjs';

describe('calculateAndValidateTotals', () => {

    test('should calculate totals correctly from line items and expenses', () => {
        const invoice = {
            lineItems: [
                { description: 'Item 1', date: '2025-01-01', hours: 10, amount: 1000.00 },
                { description: 'Item 2', date: '2025-01-02', hours: 5, amount: 500.50 }
            ],
            expenses: [
                { date: '2025-01-01', name: 'Uber', description: 'Transport', amount: 37.92 },
                { date: '2025-01-02', name: 'Uber', description: 'Transport', amount: 50.23 }
            ]
        };

        const result = calculateAndValidateTotals(invoice, null, null);

        assert.strictEqual(result.totalLineItems, 1500.50, 'Line items total should be 1500.50');
        assert.strictEqual(result.totalExpenses, 88.15, 'Expenses total should be 88.15');
        assert.strictEqual(result.calculatedTotal, 1588.65, 'Grand total should be 1588.65');
    });

    test('should round totals to 2 decimal places', () => {
        const invoice = {
            lineItems: [
                { description: 'Item 1', date: '2025-01-01', hours: 10, amount: 1000.333 }
            ],
            expenses: [
                { date: '2025-01-01', name: 'Uber', description: 'Transport', amount: 37.999 }
            ]
        };

        const result = calculateAndValidateTotals(invoice, null, null);

        assert.strictEqual(result.totalLineItems, 1000.33, 'Line items should be rounded to 2 decimals');
        assert.strictEqual(result.totalExpenses, 38.00, 'Expenses should be rounded to 2 decimals');
        assert.strictEqual(result.calculatedTotal, 1038.33, 'Grand total should be rounded to 2 decimals');
    });

    test('should validate matching explicit expenses total', () => {
        const invoice = {
            lineItems: [],
            expenses: [
                { date: '2025-01-01', name: 'Uber', description: 'Transport', amount: 37.92 },
                { date: '2025-01-02', name: 'Uber', description: 'Transport', amount: 50.23 }
            ]
        };

        const result = calculateAndValidateTotals(invoice, 88.15, null);

        assert.strictEqual(result.totalExpenses, 88.15, 'Expenses total should match');
        assert.ok(result, 'Should not throw error when totals match');
    });

    test('should validate matching explicit grand total', () => {
        const invoice = {
            lineItems: [
                { description: 'Item 1', date: '2025-01-01', hours: 10, amount: 1000.00 }
            ],
            expenses: [
                { date: '2025-01-01', name: 'Uber', description: 'Transport', amount: 166.57 }
            ]
        };

        const result = calculateAndValidateTotals(invoice, null, 1166.57);

        assert.strictEqual(result.calculatedTotal, 1166.57, 'Grand total should match');
        assert.ok(result, 'Should not throw error when totals match');
    });

    test('should throw error when explicit expenses total does not match', () => {
        const invoice = {
            lineItems: [],
            expenses: [
                { date: '2025-01-01', name: 'Uber', description: 'Transport', amount: 37.92 },
                { date: '2025-01-02', name: 'Uber', description: 'Transport', amount: 50.23 }
            ]
        };

        assert.throws(
            () => calculateAndValidateTotals(invoice, 200.00, null),
            Error,
            /Expenses total \(written: 200\.00\) does not match calculated sum \(88\.15\)/
        );
    });

    test('should throw error when explicit grand total does not match', () => {
        const invoice = {
            lineItems: [
                { description: 'Item 1', date: '2025-01-01', hours: 10, amount: 1000.00 }
            ],
            expenses: [
                { date: '2025-01-01', name: 'Uber', description: 'Transport', amount: 166.57 }
            ]
        };

        assert.throws(
            () => calculateAndValidateTotals(invoice, null, 1500.00),
            Error,
            /Grand total \(written: 1500\.00\) does not match calculated sum \(1166\.57\)/
        );
    });

    test('should handle null explicit totals (backward compatibility)', () => {
        const invoice = {
            lineItems: [
                { description: 'Item 1', date: '2025-01-01', hours: 10, amount: 1000.00 }
            ],
            expenses: [
                { date: '2025-01-01', name: 'Uber', description: 'Transport', amount: 166.57 }
            ]
        };

        const result = calculateAndValidateTotals(invoice, null, null);

        assert.ok(result, 'Should not throw error when explicit totals are null');
        assert.strictEqual(result.calculatedTotal, 1166.57, 'Should still calculate totals');
    });

    test('should handle empty line items and expenses', () => {
        const invoice = {
            lineItems: [],
            expenses: []
        };

        const result = calculateAndValidateTotals(invoice, null, null);

        assert.strictEqual(result.totalLineItems, 0, 'Line items total should be 0');
        assert.strictEqual(result.totalExpenses, 0, 'Expenses total should be 0');
        assert.strictEqual(result.calculatedTotal, 0, 'Grand total should be 0');
    });

    test('should validate both explicit totals when provided', () => {
        const invoice = {
            lineItems: [
                { description: 'Item 1', date: '2025-01-01', hours: 10, amount: 1000.00 }
            ],
            expenses: [
                { date: '2025-01-01', name: 'Uber', description: 'Transport', amount: 166.57 }
            ]
        };

        const result = calculateAndValidateTotals(invoice, 166.57, 1166.57);

        assert.ok(result, 'Should not throw error when both totals match');
        assert.strictEqual(result.totalExpenses, 166.57, 'Expenses total should match');
        assert.strictEqual(result.calculatedTotal, 1166.57, 'Grand total should match');
    });

});

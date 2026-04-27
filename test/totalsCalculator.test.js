import assert from 'node:assert';
import { describe, test } from 'node:test';
import { calculateAndValidateTotals } from '../src/totalsCalculator.mjs';

describe('calculateAndValidateTotals', () => {

    test('should calculate totals correctly from line items and expenses', () => {
        const invoice = {
            lineItems: [
                { description: 'Item 1', date: '2025-01-01', hours: 10, hourlyRate: 100, amount: 1000.00 },
                { description: 'Item 2', date: '2025-01-02', hours: 5, hourlyRate: 100, amount: 500.00 }
            ],
            expenses: [
                { date: '2025-01-01', name: 'Uber', description: 'Transport', amount: 37.92 },
                { date: '2025-01-02', name: 'Uber', description: 'Transport', amount: 50.23 }
            ]
        };

        const result = calculateAndValidateTotals(invoice, null, null);

        assert.strictEqual(result.totalLineItems, 1500.00, 'Line items total should be 1500.00');
        assert.strictEqual(result.totalTax, 0, 'No tax lines');
        assert.strictEqual(result.serviceTotal, 1500.00, 'Service total should match line sum');
        assert.strictEqual(result.totalExpenses, 88.15, 'Expenses total should be 88.15');
        assert.strictEqual(result.calculatedTotal, 1588.15, 'Grand total should be 1588.15');
    });

    test('should add table tax rows to service total and grand total', () => {
        const invoice = {
            lineItems: [
                { description: 'Work', date: '2025-01-01', hours: 10, hourlyRate: 100, amount: 1000.0 },
                { description: 'HST (13%)', date: '2025-01-01', hours: 0, amount: 130.0, rowType: 'tax' },
            ],
            expenses: [],
        };

        const result = calculateAndValidateTotals(invoice, null, null);

        assert.strictEqual(result.totalLineItems, 1000.0, 'Line subtotal');
        assert.strictEqual(result.totalTax, 130.0, 'Tax total');
        assert.strictEqual(result.serviceTotal, 1130.0, 'Service total');
        assert.strictEqual(result.calculatedTotal, 1130.0, 'Grand total');
    });

    test('should accept embedded service total when it matches subtotal + tax from table rows', () => {
        const invoice = {
            lineItems: [
                { description: 'Work', date: '2025-01-01', hours: 10, hourlyRate: 100, amount: 1000.0 },
                { description: 'HST (13%)', date: '2025-01-01', hours: 130, amount: 130.0, rowType: 'tax' },
                {
                    description: 'Total (including HST/GST)',
                    date: '2025-01-01',
                    hours: 1130,
                    amount: 1130.0,
                    rowType: 'serviceTotal',
                },
            ],
            expenses: [],
            embeddedServiceTotal: 1130.0,
        };

        const result = calculateAndValidateTotals(invoice, null, null);

        assert.strictEqual(result.totalLineItems, 1000.0, 'Subtotal');
        assert.strictEqual(result.totalTax, 130.0, 'Table tax');
        assert.strictEqual(result.serviceTotal, 1130.0, 'Embedded service total');
        assert.strictEqual(result.calculatedTotal, 1130.0, 'Grand total');
    });

    test('should throw when tax row is not 13% of taxable subtotal above it', () => {
        const invoice = {
            lineItems: [
                { description: 'Work', date: '2025-01-01', hours: 10, hourlyRate: 100, amount: 1000.0 },
                { description: 'HST (13%)', date: '2025-01-01', hours: 0, amount: 100.0, rowType: 'tax' },
            ],
            expenses: [],
        };

        assert.throws(
            () => calculateAndValidateTotals(invoice, null, null),
            Error,
            /Tax row amount \(100\) must equal 13% of taxable subtotal \(130/
        );
    });

    test('should validate tax as 13% of sum of multiple line items before the tax row', () => {
        const invoice = {
            lineItems: [
                { description: 'Web development (period A)', date: '2025-01-01', hours: 10, hourlyRate: 60, amount: 600.0 },
                { description: 'Web development (period B)', date: '2025-01-08', hours: 10, hourlyRate: 40, amount: 400.0 },
                { description: 'HST (13%)', date: '2025-01-15', hours: 0, amount: 130.0, rowType: 'tax' },
                {
                    description: 'Total (including HST/GST)',
                    date: '2025-01-15',
                    hours: 0,
                    amount: 1130.0,
                    rowType: 'serviceTotal',
                },
            ],
            expenses: [],
            embeddedServiceTotal: 1130.0,
        };

        const result = calculateAndValidateTotals(invoice, null, null);

        assert.strictEqual(result.totalLineItems, 1000.0, 'Subtotal is both periods');
        assert.strictEqual(result.totalTax, 130.0, 'Tax on combined subtotal');
        assert.strictEqual(result.serviceTotal, 1130.0);
    });

    test('should throw when embedded service total does not match subtotal + tax', () => {
        const invoice = {
            lineItems: [
                { description: 'Work', date: '2025-01-01', hours: 10, hourlyRate: 100, amount: 1000.0 },
                { description: 'HST (13%)', date: '2025-01-01', hours: 0, amount: 130.0, rowType: 'tax' },
                {
                    description: 'Total (including HST/GST)',
                    date: '2025-01-01',
                    hours: 0,
                    amount: 999.0,
                    rowType: 'serviceTotal',
                },
            ],
            expenses: [],
            embeddedServiceTotal: 999.0,
        };

        assert.throws(
            () => calculateAndValidateTotals(invoice, null, null),
            Error,
            /Service total \(written: 999\) does not match subtotal \+ tax \(1130\)/
        );
    });

    test('should throw when line item amount does not match hours × hourly rate', () => {
        const invoice = {
            lineItems: [
                { description: 'Work', date: '2025-01-01', hours: 10, hourlyRate: 100, amount: 999.0 },
            ],
            expenses: [],
        };

        assert.throws(
            () => calculateAndValidateTotals(invoice, null, null),
            Error,
            /amount \(999\) must equal hours × rate \(10 × 100 = 1000\)/
        );
    });

    test('should use line-item hourlyRate when provided', () => {
        const invoice = {
            lineItems: [
                { description: 'Custom consulting', date: '2025-01-01', hours: 3, hourlyRate: 175, amount: 525.0 },
            ],
            expenses: [],
        };

        const result = calculateAndValidateTotals(invoice, null, null);

        assert.strictEqual(result.totalLineItems, 525.0);
        assert.strictEqual(result.serviceTotal, 525.0);
        assert.strictEqual(result.calculatedTotal, 525.0);
    });

    test('should round totals to 2 decimal places', () => {
        const invoice = {
            lineItems: [
                { description: 'Item 1', date: '2025-01-01', hours: 0, amount: 1000.333 }
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
                { description: 'Item 1', date: '2025-01-01', hours: 10, hourlyRate: 100, amount: 1000.00 }
            ],
            expenses: [
                { date: '2025-01-01', name: 'Uber', description: 'Transport', amount: 166.57 }
            ]
        };

        const result = calculateAndValidateTotals(invoice, null, 1166.57);

        assert.strictEqual(result.serviceTotal, 1000.0, 'Service total before expenses');
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
                { description: 'Item 1', date: '2025-01-01', hours: 10, hourlyRate: 100, amount: 1000.00 }
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
                { description: 'Item 1', date: '2025-01-01', hours: 10, hourlyRate: 100, amount: 1000.00 }
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
                { description: 'Item 1', date: '2025-01-01', hours: 10, hourlyRate: 100, amount: 1000.00 }
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

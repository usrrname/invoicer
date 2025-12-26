import assert from 'node:assert';
import { describe, test } from 'node:test';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { fromMarkdownToPdf } from '../src/markdownParser.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('fromMarkdownToPdf', () => {


    test('should return an invoice object when given a valid markdown file', () => {
        const testMarkdownPath = join(__dirname, 'test-markdown.md');

        const invoice = fromMarkdownToPdf(testMarkdownPath);
        assert.ok(invoice, 'Invoice should be created');
        assert.strictEqual(invoice.invoiceId, 'INV-2025-123', 'Invoice ID should be INV-2025-123');
        assert.strictEqual(invoice.payer.name, 'Test Company', 'Payer name should be Test Company');
        assert.strictEqual(invoice.payer.address, '123 Main St, Anytown, USA', 'Payer address should be 123 Main St, Anytown, USA');
        assert.strictEqual(invoice.payer.telephone, '(123) 456-7890', 'Payer telephone should be (123) 456-7890');
        assert.strictEqual(invoice.payee.name, 'My Company', 'Payee name should be My Company');
        assert.strictEqual(invoice.payee.email, 'mycompany@gmail.com', 'Payee email should be mycompany@gmail.com');
        assert.strictEqual(invoice.payee.address, '456 Business Ave, Anytown, USA', 'Payee address should be 456 Business Ave, Anytown, USA');
        assert.strictEqual(invoice.payee.telephone, '(456) 789-0123', 'Payee telephone should be (456) 789-0123');

        assert.ok(invoice, 'Invoice should be created');
    });

    test('should return an error when given an invalid markdown file', () => {
        const invalidMarkdownPath = join(__dirname, 'invalid-markdown.md');
        assert.throws(() => fromMarkdownToPdf(invalidMarkdownPath), Error, 'No line items or expenses found in the invoice');
    });

});
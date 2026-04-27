# Invoicer Requirements

## 1. Purpose

`invoicer` converts a markdown invoice file into a PDF invoice using a deterministic parsing and totals-validation pipeline.

## 2. Scope

- Parse invoice data from markdown.
- Validate totals and tax math before PDF generation.
- Render invoice and expenses tables into PDF output.
- Save output into `records/YYYY/MM/` based on invoice `Date`.

Out of scope:

- Payment processing
- Currency conversion
- External API integrations

## 3. Users and Usage Context

- Primary user: a contractor/freelancer generating invoices from markdown.
- Invocation: CLI from project root.
- Command: `node src/cli.mjs <input.md> <output.pdf>`

## 4. Functional Requirements

### 4.1 Input Document Structure

The tool must support these markdown sections:

- `Invoice ID: ...` (optional)
- `Date: YYYY-MM-DD` (optional; defaults to current date when missing)
- `## Payer` with list items
- `## Payee` with list items
- `## Line Items` markdown table
- `## Expenses` markdown table (optional but supported)
- `## Total` section with explicit grand total (optional)

### 4.2 Payer and Payee Parsing

In `## Payer`, parse list item keys:

- `Name`
- `Address`
- `Telephone`

In `## Payee`, parse list item keys:

- `Name`
- `Email`
- `Address`
- `Telephone`

### 4.3 Line Items Parsing

The line items table must be parsed as:

- `Description | Date | Hours | Amount`
- or `Description | Date | Hours | Rate | Amount` (optional per-line rate)

Rules:

- Any number of billable line-item rows is supported.
- For each billable row with `Hours` > 0, `Amount` must equal `Hours ×` resolved rate (rounded to cents). Resolution order:
  - if row `Rate` is present and > 0, use that value
  - otherwise use `src/billingRates.mjs` `DEFAULT_HOURLY_RATE` (optional `HOURLY_RATE_RULES` may override as an advanced fallback)
- Rows with `Hours` 0 skip this check (flat-fee lines). Tax and service-total rows are excluded.
- `Amount` drives service subtotal, tax base, and grand total calculations.

Special row types recognized by `Description`:

- Tax row: contains tax keywords (`HST`, `GST`, `VAT`, or `PST`) and is parsed as `rowType: 'tax'`.
- Service total row: description `Total (including HST/GST)` or `Total (including HST)` and parsed as `rowType: 'serviceTotal'`.

### 4.4 Tax and Service Total Validation

Tax validation:

- For each tax row, tax amount must equal 13% of the sum of all normal billable line-item amounts above that tax row.
- Comparison must be rounded to cents.

Service total validation:

- If an embedded service total row exists, it must equal:
  - subtotal of normal billable line items
  - plus sum of tax rows
- Comparison must be rounded to cents.

### 4.5 Expenses Parsing and Validation

Expenses table columns:

- `Date | Name | Description | Amount`

Rules:

- Sum all expense `Amount` values as `totalExpenses`.
- If an explicit `Total Expenses` row is present, it must match calculated expenses total.

### 4.6 Grand Total Validation

Grand total is:

- `serviceTotal + totalExpenses`

If an explicit grand total is provided (either in expenses table or `## Total` section), it must match calculated grand total (rounded to cents).

### 4.7 Error Handling

The tool must fail with clear errors when:

- No line items and no expenses are found.
- Billable line item with `Hours` > 0 does not satisfy `Amount = Hours ×` resolved hourly rate.
- Tax row does not satisfy 13% rule.
- Embedded service total does not match subtotal + tax.
- Explicit expenses total does not match computed expenses total.
- Explicit grand total does not match computed grand total.

CLI behavior on failure:

- Print failure message.
- Exit process with non-zero status code.

### 4.8 PDF Generation

The generated PDF must include:

- Invoice header (invoice ID, payer/payee blocks)
- Line items table
- Expenses table
- Total expenses row
- Grand total row

The line-items table footer total is shown only when there is no embedded service-total row.

## 5. Non-Functional Requirements

- Runtime: Node.js ESM modules (`.mjs`).
- Deterministic calculations rounded to 2 decimals.
- Static type safety via JSDoc + `tsc --noEmit`.
- Automated tests via Node test runner.
- Maintainable separation:
  - parsing (`markdownParser.mjs`)
  - hourly rates (`billingRates.mjs`)
  - math/validation (`totalsCalculator.mjs`)
  - rendering (`invoiceTemplate.mjs`)
  - pdf generation (`pdfGenerator.mjs`)

## 6. Acceptance Criteria

1. Invoice with 1+ line items, one tax row, and one service total row validates and generates PDF.
2. Invoice with 3+ billable rows before tax validates correctly at 13% of subtotal above tax row.
3. Incorrect tax amount produces validation error and no PDF output.
4. Embedded service total mismatch produces validation error.
5. Explicit expenses/grand total mismatch produces validation error.
6. Grand total equals service total plus expenses in successful output.
7. Wrong `Hours` × rate vs `Amount` on a billable row produces validation error.
8. Test suite passes via `npm test`.
9. Typecheck passes via `npm run lint`.

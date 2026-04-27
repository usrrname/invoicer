# AGENTS.md — Invoicer

Markdown invoice → PDF (Puppeteer). **ESM** (`.mjs`), **JSDoc** + `tsc --noEmit`, **Node test runner**.

## Commands

| Task | Command |
|------|---------|
| Typecheck | `npm run lint` |
| Tests | `npm test` |
| One file | `node --test test/fromMarkdownToPdf.test.js` |
| One test | `node --test --test-name-pattern="pattern" test/….test.js` |
| CLI | `node src/cli.mjs <input.md> <output-basename.pdf>` |

Run CLI from repo root. **PDF path:** `records/<year>/<month>/<output-basename.pdf>` using segments from invoice `Date:` (`YYYY-MM-DD` → `records/YYYY/MM/`). The second argument should be a **filename** (e.g. `out.pdf`), not a full path you expect to match exactly.

**Puppeteer** needs Chrome available to the bundled version. If launch fails: `npx puppeteer browsers install chrome`.

## Pipeline

`markdownParser.fromMarkdownToPdf` → `totalsCalculator.calculateAndValidateTotals` (mutates invoice) → `pdfGenerator.generatePDF` → `invoiceTemplate.buildInvoiceHtml` + `styles.css`.

| File | Role |
|------|------|
| `src/markdownParser.mjs` | Markdown → invoice object |
| `src/billingRates.mjs` | Default hourly-rate fallback and optional advanced matching rules |
| `src/totalsCalculator.mjs` | Hour × rate checks, subtotals, tax, grand total, throws on mismatch |
| `src/invoiceTemplate.mjs` | HTML only |
| `src/styles.css` | All PDF styling |
| `src/pdfGenerator.mjs` | Temp HTML, Puppeteer PDF |
| `src/cli.mjs` | Parse args, spinner, wire parser + PDF |

## Invoice markdown (what matters for math)

- **Line items table:** `Description | Date | Hours | Amount` or `Description | Date | Hours | Rate | Amount` (optional per-line `Rate` column).
- **Hourly check:** For billable rows with `Hours` > 0, `Amount` must equal `Hours ×` rate. If row `Rate` is present, it is used; otherwise `DEFAULT_HOURLY_RATE` from `billingRates.mjs` is used (optional `HOURLY_RATE_RULES` can override as an advanced fallback). With `Hours` 0, skip this check (flat-fee line). Tax / service-total rows are excluded.
- **Totals use `Amount`** for subtotal, tax base, and PDF; tax and grand-total rules are unchanged.
- **Tax row:** description matches HST/GST/VAT/PST (word boundary); parsed as `rowType: 'tax'`. **Tax amount must equal 13% of the sum of all normal line-item amounts above that row** (rounded to cents). Any number of billable rows may appear before tax; then tax row, then service total row.
- **Service total row:** description `Total (including HST/GST)` or `Total (including HST)` → `rowType: 'serviceTotal'`, `embeddedServiceTotal`; must equal subtotal + sum of tax rows (and drives hiding the line-items table footer duplicate total).
- **No separate `## Tax` section** — tax lives in the line items table.
- **Expenses:** separate table; amounts sum to `totalExpenses`. PDF shows expenses + **Grand total** = `serviceTotal + expenses`. Optional footer rows `Total Expenses` / `Grand Total` or `Total` (non-expenses) supply explicit totals for validation.
- **`## Total` section:** optional numeric line for explicit grand total check.

## Code expectations

- Imports: `import { x } from './x.mjs'`; Puppeteer via `await import('puppeteer')` in `pdfGenerator.mjs`.
- Throw `Error` with clear messages; CLI: `spinner.fail` + `process.exit(1)` on failure.
- Match existing style: 2 spaces, single quotes, no semicolons.

When changing totals or parsing, update **`test/*.md` fixtures** and **`test/*.test.js`** together.

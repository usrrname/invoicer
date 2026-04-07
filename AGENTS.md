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
| `src/totalsCalculator.mjs` | Subtotals, tax checks, grand total, throws on mismatch |
| `src/invoiceTemplate.mjs` | HTML only |
| `src/styles.css` | All PDF styling |
| `src/pdfGenerator.mjs` | Temp HTML, Puppeteer PDF |
| `src/cli.mjs` | Parse args, spinner, wire parser + PDF |

## Invoice markdown (what matters for math)

- **Line items table:** `Description | Date | Hours | Amount`
- **Totals use `Amount` only.** `Hours` is display-only (not × rate).
- **Tax row:** description matches HST/GST/VAT/PST (word boundary); parsed as `rowType: 'tax'`. If it is the **second** row and the first row is a normal line, **tax amount must equal 13% of the first row’s amount** (rounded to cents).
- **Service total row:** description `Total (including HST/GST)` or `Total (including HST)` → `rowType: 'serviceTotal'`, `embeddedServiceTotal`; must equal subtotal + sum of tax rows (and drives hiding the line-items table footer duplicate total).
- **No separate `## Tax` section** — tax lives in the line items table. Must equal 13% of the first row’s amount (rounded to cents).
- **Expenses:** separate table; amounts sum to `totalExpenses`. PDF shows expenses + **Grand total** = `serviceTotal + expenses`. Optional footer rows `Total Expenses` / `Grand Total` or `Total` (non-expenses) supply explicit totals for validation.
- **`## Total` section:** optional numeric line for explicit grand total check.

## Code expectations

- Imports: `import { x } from './x.mjs'`; Puppeteer via `await import('puppeteer')` in `pdfGenerator.mjs`.
- Throw `Error` with clear messages; CLI: `spinner.fail` + `process.exit(1)` on failure.
- Match existing style: 2 spaces, single quotes, no semicolons.

When changing totals or parsing, update **`test/*.md` fixtures** and **`test/*.test.js`** together.

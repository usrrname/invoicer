# Invoice

Invoice ID: INV-2026-001
Date: 2026-04-14

## Payer

<!-- Payer information -->

- Name: Angry Chocolates, Inc.
- Address: 123 Main St, Anytown, USA
- Telephone: (123) 456-7890

## Payee

<!-- Payee information below -->

- Name: My Company
- Email: mycompany@gmail.com
- Address: 456 Business Ave, Anytown, USA
- Telephone: (456) 789-0123

## Line Items

Add **any number** of service line items (e.g. one row per billing period), then one row **HST/GST (13%)** whose amount is 13% of the **sum** of those line items (rounded to cents), then **Total (including HST/GST)** equal to that subtotal plus tax.  
Optional: include a `Rate` column and set a per-line hourly rate; when present, validation uses that row's `Rate`.

| Description | Date                    | Hours | Rate | Amount   |
| ------------------------------------ | ----------------------- | ----- | ---- | -------- |
| Services — 2026-03-16 to 2026-03-27 | 2026-03-16 – 2026-03-27 | 10    | 100  | 1000.00  |
| Services — 2026-03-30 to 2026-04-10 | 2026-03-30 – 2026-04-10 | 10    | 100  | 1000.00  |
| HST/GST (13%)                        | 2026-04-14              |       |      | 260.00   |
| Total (including HST/GST)            | 2026-04-14              |       |      | 2260.00  |

## Expenses

| Date                | Name | Description           | Amount |
| ------------------- | ---- | --------------------- | ------ |
| 2025-11-10 6:46 PM  | Uber | Transport to office   | 37.92  |

<!-- OPTIONAL: Total expenses will be calculated automatically if no heading or value is provided -->
<!-- | **Total Expenses** | | | $370.23 | -->

<!-- OPTIONAL: Total will be calculated automatically if no heading or value is provided -->
<!-- | **Total** | | | $17071.57 | -->

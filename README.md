# Invoicer

A CLI tool that converts markdown invoice files into PDF documents.

## Usage

Run the CLI tool with an input markdown file and output PDF filename:

```bash
node src/cli.mjs <input-markdown-file> <output-pdf-file>
```

### Example

```bash
node src/cli.mjs invoice-template.md invoice.pdf
```

The generated PDF will be saved in `records/YYYY/MM/` directory structure.

## Input File Format

The markdown input file should contain invoice information in the following format:

```markdown
# Invoice

Invoice ID: INV-2025-001
Date: 2025-12-25

## Payer

- Name: Company Name
- Address: 123 Main St, City, State 12345
- Telephone: (555) 123-4567

## Payee

- Name: Your Name
- Email: your@email.com
- Address: 456 Business Ave, City, State 67890
- Telephone: (555) 987-6543

## Line Items

| Description          | Date                    | Hours  | Amount   |
| -------------------- | ----------------------- | ------ | -------- |
| Web Development      | 2024-01-15              | 8      | 1500.00  |
| Design Services      | 2024-01-16              | 4      | 800.00   |

## Expenses

| Date       | Name | Description           | Amount |
| ---------- | ---- | --------------------- | ------ |
| 2024-01-10 | Uber | Transport to office   | 50.00  |
| 2024-01-15 | Taxi | Transport from office | 30.00  |
```

### Supported Fields

- **Invoice ID**: Unique identifier for the invoice (optional)
- **Date**: Invoice date (optional, defaults to current date)
- **Payer Section**: Contains payer information as list items
  - `Name`: Name of the invoice recipient
  - `Address`: Address of the recipient
  - `Telephone`: Contact phone number
- **Payee Section**: Contains payee information as list items
  - `Name`: Name of the person/company issuing the invoice
  - `Email`: Email address of the invoicer
  - `Address`: Address of the invoicer
  - `Telephone`: Contact phone number
- **Line Items Table**: Markdown table with columns: Description, Date, Hours, Amount
- **Expenses Table**: Markdown table with columns: Date, Name, Description, Amount
- **Total**: Calculated automatically from line items and expenses

## Project Structure

```
invoicer/
├── src/
│   ├── cli.mjs              # Command-line interface
│   ├── markdownParser.mjs   # Markdown to Invoice parser
│   ├── pdfGenerator.mjs    # PDF generation from Invoice
│   ├── spinner.mjs          # Loading spinner component
│   └── styles.css           # PDF styling
├── test/                    # Test files
├── records/                 # Generated PDF output directory
│   └── YYYY/MM/            # Organized by year and month
├── invoice-template.md      # Example invoice template
├── package.json
├── tsconfig.json           # TypeScript config for type checking
└── README.md
```

## Dependencies

- **md-to-pdf**: Converts markdown to PDF
- **dotenv**: Environment variable management

### Dev Dependencies

- **typescript**: TypeScript compiler for type checking
- **@types/node**: Node.js type definitions

## Development

### Scripts

- `npm run lint`: Type check the codebase
- `npm run build`: Compile TypeScript (if applicable)
- `npm test`: Run tests

### Type Checking

The project uses TypeScript for type checking (via JSDoc comments). To check types:

```bash
npm run lint
```

## License

ISC

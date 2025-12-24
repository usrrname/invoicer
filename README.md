# Invoicer

A TypeScript-based CLI that converts markdown invoice files into PDF documents.

## Usage

Run the CLI tool with an input markdown file and output PDF path:

```bash
node dist/cli.js <input-markdown-file> <output-pdf-file>
```

### Example

```bash
node dist/cli.js invoice.txt invoice.pdf
```

## Input File Format

The markdown input file should contain invoice information in the following format:

```
Recipient Name: John Doe
Recipient Address: 123 Main St, City, State 12345
Telephone Number: (555) 123-4567
Invoicer Name: Jane Smith
Invoicer Email: jane@example.com
Invoicer Address: 456 Business Ave, City, State 67890
Line Item: Web Development, 2024-01-15, 8, 1500.00
Line Item: Design Services, 2024-01-16, 4, 800.00
Expenses: 200.00
Total: 2500.00
```

### Supported Fields

- `Recipient Name`: Name of the invoice recipient
- `Recipient Address`: Address of the recipient
- `Telephone Number`: Contact phone number
- `Invoicer Name`: Name of the person/company issuing the invoice
- `Invoicer Email`: Email address of the invoicer
- `Invoicer Address`: Address of the invoicer
- `Line Item: <description>, <date>, <hours>, <amount>`: Individual line items (can be multiple). Format: description, date (YYYY-MM-DD), number of hours, amount
- `Expenses`: Additional expenses amount
- `Total`: Total invoice amount

## Project Structure

```
invoicer/
├── src/
│   ├── cli.mjs              # Command-line interface
│   ├── markdownParser.mjs   # Markdown to Invoice parser
│   └── pdfGenerator.mjs    # PDF generation from Invoice
├── dist/                   # Compiled JavaScript output
├── package.json
├── tsconfig.json
└── README.md
```

## Dependencies

- **markdown-pdf**: Converts markdown to PDF
- **dotenv**: Environment variable management
- **typescript**: TypeScript compiler
- **@types/node**: Node.js type definitions
- **@types/markdown-pdf**: Type definitions for markdown-pdf

## Development

The project uses TypeScript with strict type checking. To compile:

```bash
npx tsc
```

## License

ISC

import * as fs from 'fs';
import markdownpdf from 'markdown-pdf';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generates a PDF from an Invoice object.
 * @param {Invoice} invoice - The invoice details.
 * @param outputFilePath path to save the generated PDF.
 */
export function generatePDF(invoice, outputFilePath) {

  const lineItemsTotal = invoice.lineItems.reduce((sum, item) => sum + parseFloat(item.amount ?? 0, 2), 0);

  const expensesTotal = Array.isArray(invoice.expenses) 
    ? invoice.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount, 2), 0)
    : (invoice.expenses || 0);
  
  const calculatedTotal = lineItemsTotal + expensesTotal;
  const total = invoice.total > 0 ? invoice.total : calculatedTotal;
  
  const markdownContent = `## Invoice #${invoice.invoiceId}
| **To:** ${invoice.payee.name} | **From:** ${invoice.invoicer.name}                                    |
|:------------------------------|:------------------------------------------------- |
| ${invoice.payee.address}      | ${invoice.invoicer.email} ${invoice.invoicer.address} ${invoice.invoicer.telephone} |

| **Description** | **Date** | **Hours** | **Amount** |
|:----------------|:---------|:----------|:-----------|
${invoice.lineItems
    .map((item) => `| ${item.description} | ${item.date ?? ''} | ${item.hours ?? ''} | $${item.amount} |`)
    .join('\n')} |

| **Description** | **Date** | **Name** | **Amount** |
|:----------------|:---------|:---------|:-----------|
${Array.isArray(invoice.expenses) && invoice.expenses.length > 0
    ? invoice.expenses
        .map((expense) => `| ${expense.description} | ${expense.date} | ${expense.name} | $${expense.amount} |`)
        .join('\n')
    : '| | | | |'}
| **Total** | | | **$${total}** |
`;

  // Save the markdown content to a temporary file
  const tempMarkdownPath = 'temp-invoice.md';
  fs.writeFileSync(tempMarkdownPath, markdownContent);

  // Get path to CSS file
  const cssPath = join(__dirname, 'styles.css');

  // Convert markdown to PDF with styling
  markdownpdf({
    cssPath: cssPath,
    paperFormat: 'A4',
    paperOrientation: 'portrait',
    paperBorder: '1cm',
    renderDelay: 1000,
    type: 'pdf',
    quality: 100
  })
    .from(tempMarkdownPath)
    .to(outputFilePath, () => {
      console.log(`PDF generated successfully at ${outputFilePath}`);

      // Clean up the temporary markdown file
      fs.unlinkSync(tempMarkdownPath);
    });
}


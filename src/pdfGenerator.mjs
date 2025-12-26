import * as fs from 'fs';
import { mdToPdf } from 'md-to-pdf';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


/**
 * Generates a PDF from an Invoice object.
 * @param {Invoice} invoice - The invoice details.
 * @param outputFilePath path to save the generated PDF.
 */
export async function generatePDF(invoice, outputFilePath) {

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
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();

  // Save the markdown content to a temporary file
  const tempMarkdownPath = `${year}-${month}-${day}-temp-invoice.md`;
  fs.writeFileSync(tempMarkdownPath, markdownContent);

  // Get path to CSS file
  const cssPath = join(__dirname, 'styles.css');

  // Convert markdown to PDF with styling
  try {
    const pdf = await mdToPdf(
      { path: tempMarkdownPath },
      {
        stylesheet: cssPath,
        pdf_options: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '1cm',
            right: '1cm',
            bottom: '1cm',
            left: '1cm',
          },
        },
      }
    );

    if (pdf) {
      fs.writeFileSync(outputFilePath, pdf.content);
      // Clean up the temporary markdown file
      fs.unlinkSync(tempMarkdownPath);
    } else {
      throw new Error('Failed to generate PDF');
    }
  } catch (error) {
    // Clean up the temporary markdown file even on error
    if (fs.existsSync(tempMarkdownPath)) {
      fs.unlinkSync(tempMarkdownPath);
    }
    throw error;
  }
}


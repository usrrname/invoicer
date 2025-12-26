import * as fs from 'fs';
import { mdToPdf } from 'md-to-pdf';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generates a PDF from an Invoice object.
 * @param {Invoice} invoice - The invoice details.
 * @param outputFileName name of the output PDF file.
 */
export async function generatePDF(invoice, outputFileName) {

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();

  const fileNameHasExtension = outputFileName.endsWith('.pdf');

  const outputFilePath = join(__dirname, '..', 'records', year.toString(), month.toString(), fileNameHasExtension ? outputFileName : `${outputFileName}.pdf`);

  const lineItemsTotal = invoice.lineItems.reduce((sum, item) => sum + parseFloat(item.amount ?? 0, 2), 0);

  const expensesTotal = Array.isArray(invoice.expenses) 
    ? invoice.expenses.reduce((sum, expense) => sum + parseFloat(expense.amount, 2), 0)
    : (invoice.expenses || 0);
  
  const calculatedTotal = lineItemsTotal + expensesTotal;
  const total = lineItemsTotal + expensesTotal;
  
  const markdownContent = `## Invoice #${invoice.invoiceId}
| **To:** ${invoice.payer.name} | **From:** ${invoice.payee.name}                                    |
|:------------------------------|:------------------------------------------------- |
| ${invoice.payer.address}      | ${invoice.payee.address} ${invoice.payee.telephone} ${invoice.payee.email}|

| **Date** | **Description** | **Hours** | **Amount** |
|:---------|:----------------|:----------|:-----------|
${invoice.lineItems
    .map((item) => `| ${item.description} | ${item.date ?? ''} | ${item.hours ?? ''} | $${item.amount} |`)
    .join('\n')} |

| **Date** | **Name** | **Description** | **Amount** |
|:---------|:---------|:----------------|:-----------|
${Array.isArray(invoice.expenses) && invoice.expenses.length > 0
    ? invoice.expenses
        .map((expense) => `| ${expense.description} | ${expense.date} | ${expense.name} | $${expense.amount} |`)
        .join('\n')
    : '| | | | |'}
  
| **Total Expenses** | | | ${expensesTotal > 0 ? `**$${expensesTotal}**` : ''} |

| **Total** | | | ${total > 0 ? `**$${total}**` : ''} |
`;
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
    console.error(error);
  }
  finally {
    // Clean up the temporary markdown file
    if (fs.existsSync(tempMarkdownPath)) {
      fs.unlinkSync(tempMarkdownPath);
    }
  }
}


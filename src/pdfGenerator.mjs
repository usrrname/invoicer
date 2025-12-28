import * as fs from 'fs';
import { dirname, join } from 'path';
import { markdown } from 'tinypdf';
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

  const outputFilePath = join(__dirname, '..', 'records', year.toString(), month.toString(), fileNameHasExtension ? outputFileName : `${year}-${month}-${day}-${invoice.invoiceId}-invoice.pdf`);

  const lineItemsTotal = invoice.lineItems.reduce((sum, item) => sum + parseFloat(item.amount ?? 0, 2), 0);

  const expensesTotal = Array.isArray(invoice.expenses) 
    ? invoice.expenses.reduce((sum, expense) => sum + parseFloat(+expense.amount, 2), 0)
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
  // Convert markdown to PDF
  try {
    // A4 dimensions in points: 595.28 x 841.89
    // Convert 1cm margin to points: 1cm ≈ 28.35 points
    const marginPoints = 28.35;
    const a4Width = 595.28;
    const a4Height = 841.89;
    
    const pdfBuffer = markdown(markdownContent, {
      width: a4Width - (marginPoints * 2), // Account for left and right margins
      height: a4Height - (marginPoints * 2), // Account for top and bottom margins
      margin: marginPoints,
    });

    if (pdfBuffer) {
      fs.writeFileSync(outputFilePath, Buffer.from(pdfBuffer));
    } else {
      throw new Error('Failed to generate PDF');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}


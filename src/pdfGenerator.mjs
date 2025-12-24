import * as fs from 'fs';
import markdownpdf from 'markdown-pdf';

/**
 * Generates a PDF from an Invoice object.
 * @param {Invoice} invoice - The invoice details.
 * @param outputFilePath path to save the generated PDF.
 */
export function generatePDF(invoice, outputFilePath) {
  // Calculate total from line items and expenses
  const lineItemsTotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const expensesTotal = Array.isArray(invoice.expenses) 
    ? invoice.expenses.reduce((sum, expense) => sum + expense.cost, 0)
    : (invoice.expenses || 0);
  
  const calculatedTotal = lineItemsTotal + expensesTotal;
  const total = invoice.total > 0 ? invoice.total : calculatedTotal;

  const markdownContent = `# Invoice

**Recipient Name:** ${invoice.recipientName}
**Recipient Address:** ${invoice.recipientAddress}
**Telephone Number:** ${invoice.telephoneNumber}

**Invoicer Name:** ${invoice.invoicerName}
**Invoicer Email:** ${invoice.invoicerEmail}
**Invoicer Address:** ${invoice.invoicerAddress}

### Line Items:

| Description | Date | Hours/Name | Amount |
|-------------|------|-----------|--------|
${invoice.lineItems
      .map((item) => `| ${item.description} | ${item.date} | ${item.hours} | $${item.amount} |`)
    .join('\n')}

### Expenses:

| Description | Date | Name | Amount |
|-------------|------|-------|--------|
${Array.isArray(invoice.expenses) 
    ? invoice.expenses
        .map((expense) => `| ${expense.description} | ${expense.date} | ${expense.name} | $${expense.cost} |`)
        .join('\n')
    : '| | | | |'}
| **Total** | | | **$${total}** |
`;

  // Save the markdown content to a temporary file
  const tempMarkdownPath = 'tempInvoice.md';
  fs.writeFileSync(tempMarkdownPath, markdownContent);

  // Convert markdown to PDF
  markdownpdf()
    .from(tempMarkdownPath)
    .to(outputFilePath, () => {
      console.log(`PDF generated successfully at ${outputFilePath}`);

      // Clean up the temporary markdown file
      fs.unlinkSync(tempMarkdownPath);
    });
}


import * as fs from 'fs';
import markdownpdf from 'markdown-pdf';
import type { Invoice } from './markdownParser';

/**
 * Generates a PDF from an Invoice object.
 * @param invoice The invoice details.
 * @param outputFilePath The path to save the generated PDF.
 */
export function generatePDF(invoice: Invoice, outputFilePath: string): void {
  const markdownContent = `# Invoice

**Recipient Name:** ${invoice.recipientName}
**Recipient Address:** ${invoice.recipientAddress}
**Telephone Number:** ${invoice.telephoneNumber}

**Invoicer Name:** ${invoice.invoicerName}
**Invoicer Email:** ${invoice.invoicerEmail}
**Invoicer Address:** ${invoice.invoicerAddress}

## Line Items:
${invoice.lineItems
      .map((item) => `- ${item.description} (Date: ${item.date}, Hours: ${item.hours}): $${item.amount}`)
      .join('\n')}

**Expenses:** $${invoice.expenses}
**Total:** $${invoice.total}
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


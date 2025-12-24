import * as fs from 'fs';

export interface Invoice {
  recipientName: string;
  recipientAddress: string;
  telephoneNumber: string;
  invoicerName: string;
  invoicerEmail: string;
  invoicerAddress: string;
  lineItems: LineItem[];
  expenses: number;
  total: number;
}
export type LineItem = { description: string; amount: number };

export function parseMarkdownToInvoice(filePath: string): Invoice {
  const markdownContent = fs.readFileSync(filePath, 'utf-8');

  const lines = markdownContent.split('\n');
  
  if (lines.length === 0) {
    throw new Error('File is empty');
  }

  const invoice: Invoice = {
    recipientName: '',
    recipientAddress: '',
    telephoneNumber: '',
    invoicerName: '',
    invoicerEmail: '',
    invoicerAddress: '',
    lineItems: [],
    expenses: 0,
    total: 0,
  };

  lines.forEach((line: string) => {
    if (line.startsWith('Recipient Name:')) {
      invoice.recipientName = line.replace('Recipient Name:', '').trim();
    } else if (line.startsWith('Recipient Address:')) {
      invoice.recipientAddress = line.replace('Recipient Address:', '').trim();
    } else if (line.startsWith('Telephone Number:')) {
      invoice.telephoneNumber = line.replace('Telephone Number:', '').trim();
    } else if (line.startsWith('Invoicer Name:')) {
      invoice.invoicerName = line.replace('Invoicer Name:', '').trim();
    } else if (line.startsWith('Invoicer Email:')) {
      invoice.invoicerEmail = line.replace('Invoicer Email:', '').trim();
    } else if (line.startsWith('Invoicer Address:')) {
      invoice.invoicerAddress = line.replace('Invoicer Address:', '').trim();
    } else if (line.startsWith('Line Item:')) {

      const [description, amount] = line.replace('Line Item:', '').split(',') ?? [];
      if (description && amount) {
        invoice.lineItems.push({
          description: description.trim(),
          amount: parseFloat(amount.trim()),
        });
      }
    } else if (line.startsWith('Expenses:')) {
      invoice.expenses = parseFloat(line.replace('Expenses:', '').trim());
    } else if (line.startsWith('Total:')) {
      invoice.total = parseFloat(line.replace('Total:', '').trim());
    }
  });

  return invoice;
}


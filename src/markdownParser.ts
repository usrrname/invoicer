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
export type LineItem = { description: string; date: string; hours: number; amount: number };

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
    const propertyMapping: { [key: string]: keyof Invoice } = {
      'Recipient Name:': 'recipientName',
      'Recipient Address:': 'recipientAddress',
      'Telephone Number:': 'telephoneNumber',
      'Invoicer Name:': 'invoicerName',
      'Invoicer Email:': 'invoicerEmail',
      'Invoicer Address:': 'invoicerAddress',
    };

    for (const prefix in propertyMapping) {
      if (line.startsWith(prefix)) {
        // @ts-expect-error - types are known safe by control
        invoice[propertyMapping[prefix]] = line.replace(prefix, '').trim();
        return;
      }
    }

    if (line.startsWith('Line Item:')) {
      const parts = line.replace('Line Item:', '').split(',').map(p => p.trim());
      const [description, date, hours, amount] = parts;
      if (
        parts.length >= 4 &&
        description?.trim() !== '' &&
        date?.trim() !== '' &&
        hours?.trim() !== '' &&
        amount?.trim() !== ''
      ) {
        invoice.lineItems.push({
          description: description?.trim() ?? '',
          date: date?.trim() ?? '',
          hours: parseFloat(hours?.trim() ?? '0'),
          amount: parseFloat(amount?.trim() ?? '0'),
        });
      }
    } else if (line.startsWith('Expenses:')) {
      invoice.expenses = parseFloat(line.replace('Expenses:', '').trim());
    } else if (line.startsWith('Total:')) {
      invoice.total = parseFloat(line.replace('Total:', '').trim());
    }
  });

  if (invoice.lineItems.length === 0) {
    throw new Error('No line items found in the invoice');
  }

  return invoice;
}


import * as fs from 'fs';

/**
 * @type {Invoice}
 * @property {string} recipientName
 * @property {string} recipientAddress
 * @property {string} telephoneNumber
 * @property {string} invoicerName
 * @property {string} invoicerEmail
 * @property {string} invoicerAddress
 * @property {Array<{description: string, date: string, hours: number, amount: number}>} lineItems
 * @property {number} expenses
 * @property {number} total
 */
export const Invoice = {
  recipientName: '',
  recipientAddress: '',
  telephoneNumber: '',
  invoicerName: '',
  invoicerEmail: '',
  invoicerAddress: '',
  lineItems: [],
  expenses: 0,
  total: 0,
}

/**
 * @param {string} filePath
 * @returns {Invoice}
 */
export function parseMarkdownToInvoice(filePath) {
  const markdownContent = fs.readFileSync(filePath, 'utf-8');

  const lines = markdownContent.split('\n');
  
  if (lines.length === 0) {
    throw new Error('File is empty');
  }


  const invoice = Object.assign({}, Invoice);
  
  lines.forEach((line) => {
    const propertyMapping = {
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


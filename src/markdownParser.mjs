import * as fs from 'fs';

/**
 * @typedef {Object} Payer
 * @property {string} name
 * @property {string} address
 * @property {string} telephone
 * @typedef {Object} Payee
 * @property {string} name
 * @property {string} email
 * @property {string} address
 * @property {string} telephone
 * @typedef {Object} LineItem
 * @property {string} description
 * @property {string} date
 * @property {number} hours
 * @property {number} amount
 * @typedef {Object} Expense
 * @property {string} date
 * @property {string} name
 * @property {string} description
 * @property {number} amount
 * @type {Invoice}
 * @property {string} invoiceId
 * @property {Payer} payer
 * @property {Payee} payee
 * @property {Array<LineItem>} lineItems
 * @property {Array<Expense>} expenses
 * @property {number} total
 * @property {Date | null } date - date invoice issued on
 */
export const Invoice = {
  invoiceId: '',
  payer: {
    name: '',
    address: '',
    telephone: '',
  },
  payee: {
    name: '',
    email: '',
    address: '',
    telephone: '',
  },
  lineItems: [],
  expenses: [],
  total: 0,
  date: '',
}


/**
 * Parses a markdown table row into an array of cell values
 * @param {string} line - The table row line
 * @returns {string[]} Array of cell values
 */
function parseTableRow(line) {
  // Remove leading/trailing pipes and split by pipe
  return line
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

/**
 * Checks if a line is a table separator (e.g., |---|---|)
 * @param {string} line - The line to check
 * @returns {boolean}
 */
function isTableSeparator(line) {
  return /^\|[\s\-:|]+\|$/.test(line.trim());
}

/**
 * Checks if a line is a table row
 * @param {string} line - The line to check
 * @returns {boolean}
 */
function isTableRow(line) {
  return line.trim().startsWith('|') && line.trim().endsWith('|');
}

/**
 * Parses a list item (e.g., "- Name: value")
 * @param {string} line - The line to parse
 * @returns {{key: string, value: string}|null}
 */
function parseListItem(line) {
  const match = line.match(/^-\s*([^:]+):\s*(.+)$/);
  const key = match[1].trim().toLowerCase()
  const value = match[2].trim()
  return { key, value };
}

/**
 * Checks if a line is a comment
 * @param {string} line - The line to check
 * @returns {boolean}
 */
function isComment(line) {
  return line.trim().startsWith('<!--') && line.trim().endsWith('-->');
}

/**
 * @param {string} filePath
 * @returns {Invoice}
 */
export function fromMarkdownToPdf(filePath) {
  const markdownContent = fs.readFileSync(filePath, 'utf-8');
  const lines = markdownContent.split('\n');
  
  if (lines.length === 0) {
    throw new Error('File is empty');
  }

  const currentDate = new Date().getFullYear() + '-' + new Date().getMonth() + '-' + new Date().getDate();

  const invoice = {
    invoiceId: '',
    payer: { name: '', address: '', telephone: '' },
    payee: { name: '', email: '', address: '', telephone: '' },
    lineItems: [],
    expenses: [],
    totalExpenses: 0,
    total: 0,
    date: currentDate,
  };

  let currentSection = null;
  let inLineItemsTable = false;
  let inExpensesTable = false;
  let tableHeaderParsed = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine || isComment(trimmedLine)) {
      continue;
    }

    // Detect section headings
    if (trimmedLine.startsWith('## ')) {
      const sectionName = trimmedLine.replace('## ', '').toLowerCase();
      currentSection = sectionName;
      inLineItemsTable = sectionName === 'line items';
      inExpensesTable = sectionName === 'expenses';
      tableHeaderParsed = false;
      continue;
    }

    // Handle Invoice ID at the top level
    if (trimmedLine.startsWith('Invoice ID:')) {
      invoice.invoiceId = trimmedLine.replace('Invoice ID:', '').trim();
      continue;
    }

    if (trimmedLine.startsWith('Date:')) {
      invoice.date = trimmedLine.replace('Date:', '').trim() ?? currentDate;
      continue;
    }

    // Handle list items in Recipient section
    if (currentSection === 'payer') {
      const listItem = parseListItem(trimmedLine);
      if (listItem) {
        switch (listItem.key) {
          case 'name':
            invoice.payer.name = listItem.value;
            break;
          case 'address':
            invoice.payer.address = listItem.value;
            break;
          case 'telephone':
            invoice.payer.telephone = listItem.value;
            break;
        }
      }
      continue;
    }

    // Handle list items in payee section
    if (currentSection === 'payee') {
      const listItem = parseListItem(trimmedLine);
      if (listItem) {
        switch (listItem.key) {
          case 'name':
            invoice.payee.name = listItem.value;
            break;
          case 'email':
            invoice.payee.email = listItem.value;
            break;
          case 'address':
            invoice.payee.address = listItem.value;
            break;
          case 'telephone':
            invoice.payee.telephone = listItem.value;
            break;
        }
      }
      continue;
    }

    // Handle Line Items table
    if (inLineItemsTable && isTableRow(trimmedLine)) {
      // Skip separator rows
      if (isTableSeparator(trimmedLine)) {
        continue;
      }
      
      const cells = parseTableRow(trimmedLine);
      
      // Skip header row (first row after section heading)
      if (!tableHeaderParsed) {
        tableHeaderParsed = true;
        continue;
      }
      
      // Parse data row: Description | Date | Hours | Amount
      if (cells.length >= 4) {
        const [description, date, hours, amount] = cells;
        if (description && date) {
          invoice.lineItems.push({
            description,
            date,
            hours: parseFloat(hours) || 0,
            amount: parseFloat(amount) || 0,
          });
        }
      }
      continue;
    }

    // Handle Expenses table
    if (inExpensesTable && isTableRow(trimmedLine)) {
      // Skip separator rows
      if (isTableSeparator(trimmedLine)) {
        continue;
      }
      
      const cells = parseTableRow(trimmedLine);
      
      // Skip header row
      if (!tableHeaderParsed) {
        tableHeaderParsed = true;
        continue;
      }
      
      // Parse data row: Date | Name | Description | Amount
      if (cells.length >= 4) {
        const [date, name, description, amount] = cells;
        if (date && name) {
          invoice.expenses.push({
            date,
            name,
            description,
            amount: parseFloat(amount) || 0,
          });
        }
      }
      continue;
    }

    // Handle Total section
    if (currentSection === 'total') {
      const totalValue = parseFloat(trimmedLine);
      if (!isNaN(totalValue)) {
        invoice.total = totalValue;
      }
      continue;
    }
  }

  if (invoice.lineItems.length === 0 && invoice.expenses.length === 0) {
    throw new Error('No line items or expenses found in the invoice');
  }

  return invoice;
}

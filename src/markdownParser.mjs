import * as fs from 'fs';

/**
 * @typedef {Object} Payee
 * @property {string} name
 * @property {string} address
 * @property {string} telephone
 * @typedef {Object} Invoicer
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
 * @property {Payee} payee
 * @property {Invoicer} invoicer
 * @property {Array<LineItem>} lineItems
 * @property {Array<Expense>} expenses
 * @property {number} total
 */
export const Invoice = {
  invoiceId: '',
  payee: {
    name: '',
    address: '',
    telephone: '',
  },
  invoicer: {
    name: '',
    email: '',
    address: '',
    telephone: '',
  },
  lineItems: [],
  expenses: [],
  total: 0,
}

/**
 * Property mapping from markdown prefixes to invoice property paths
 */
const PROPERTY_MAPPING = {
  'Invoice ID:': 'invoiceId',
  'Recipient Name:': 'payee.name',
  'Recipient Address:': 'payee.address',
  'Recipient Telephone:': 'payee.telephone',
  'Invoicer Name:': 'invoicer.name',
  'Invoicer Email:': 'invoicer.email',
  'Invoicer Address:': 'invoicer.address',
  'Invoicer Telephone:': 'invoicer.telephone',
};

/**
 * Sets a value on an object using a dot-notation path
 * @param {Object} obj - The object to set the value on
 * @param {string} path - The property path (e.g., 'payee.name' or 'invoiceId')
 * @param {any} value - The value to set
 */
function setNestedProperty(obj, path, value) {
  if (path.includes('.')) {
    const [parent, child] = path.split('.');
    obj[parent][child] = value;
  } else {
    obj[path] = value;
  }
}

/**
 * Parses a line item from a markdown line
 * @param {string} line - The line to parse
 * @returns {LineItem|null} The parsed line item or null if invalid
 */
function parseLineItem(line) {
  const parts = line.replace('Line Item:', '')
    .split(',')
    .map(p => p.trim());
  
  const [description, date, hours, amount, invoiceId] = parts;
  
  if (parts.length < 4 || !description || !date || !hours || !amount) {
    return null;
  }

  return {
    invoiceId: invoiceId ?? '',
    description: description,
    date: date,
    hours: parseFloat(hours) || 0,
    amount: parseFloat(amount) || 0,
  };
}

/**
 * Parses an expense from a markdown line
 * @param {string} line - The line to parse
 * @returns {Expense|null} The parsed expense or null if invalid
 */
function parseExpense(line) {
  const parts = line.replace('Expense:', '')
    .split(',')
    .map(p => p.trim());
  
  const [date, name, description, amount] = parts;
  
  if (parts.length < 4 || !date || !name || !description || !amount) {
    return null;
  }

  return {
    date: date,
    name: name,
    description: description,
    amount: parseFloat(amount) || 0,
  };
}

/**
 * Processes a single line and updates the invoice object
 * @param {string} line - The line to process
 * @param {Invoice} invoice - The invoice object to update
 */
function processLine(line, invoice) {
  // Handle property mappings (Invoice ID, Recipient, Invoicer fields)
  for (const prefix in PROPERTY_MAPPING) {
    if (line.startsWith(prefix)) {
      const value = line.replace(prefix, '').trim();
      const path = PROPERTY_MAPPING[prefix];
      setNestedProperty(invoice, path, value);
      return;
    }
  }

  // Handle line items
  if (line.startsWith('Line Item:')) {
    const lineItem = parseLineItem(line);
    if (lineItem) {
      invoice.lineItems.push(lineItem);
    }
    return;
  }

  // Handle expenses
  if (line.startsWith('Expense:')) {
    const expense = parseExpense(line);
    if (expense) {
      invoice.expenses.push(expense);
    }
    return;
  }

  // Handle total
  if (line.startsWith('Total:')) {
    const totalValue = line.replace('Total:', '').trim();
    invoice.total = parseFloat(totalValue) || 0;
  }
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

  const invoice = Object.assign({}, Invoice);
  
  lines.forEach((line) => {
    processLine(line, invoice);
  });

  if (invoice.lineItems.length === 0 && invoice.expenses.length === 0) {
    throw new Error('No line items or expenses found in the invoice');
  }

  return invoice;
}


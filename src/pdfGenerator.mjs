import * as fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { buildInvoiceHtml } from './invoiceTemplate.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getCurrentDate = () => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const day = new Date().getDate();
  return `${year}-${month}-${day}`;
};

/**
 * Generates a PDF from an Invoice object. Handles only data and rendering
 * orchestration; all styling is in styles.css (applied via HTML).
 *
 * @param {Invoice} invoice - The invoice details.
 * @param {string} outputFileName - Name of the output PDF file.
 */
export async function generatePDF(invoice, outputFileName) {
  // if there is a date in the output markdown file, use it, otherwise use the current date and year
  const dateFromMarkdown = invoice.date;
  let outputFolder = __dirname;
  if (dateFromMarkdown) {
    const [year, month, day] = dateFromMarkdown.split('-');
    outputFolder = join(__dirname, '..', 'records', year, month);
  } else {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    outputFolder = join(__dirname, '..', 'records', year, month);
  }

  const fileNameHasExtension = outputFileName.endsWith('.pdf');
  const outputFilePath = join(outputFolder, fileNameHasExtension ? outputFileName : `${invoice.date}-${invoice.invoiceId}-invoice.pdf`);

  const lineItemsTotal = invoice.lineItems.reduce(
    (sum, item) => sum + parseFloat(item.amount ?? 0, 2),
    0
  );
  const expensesTotal =
    Array.isArray(invoice.expenses) ?
      invoice.expenses.reduce((sum, expense) => sum + parseFloat(+expense.amount, 2), 0)
    : (invoice.expenses || 0);
  const total = lineItemsTotal + expensesTotal;

  const totals = { lineItemsTotal, expensesTotal, total };
  const html = buildInvoiceHtml(invoice, totals);

  const dir = dirname(outputFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const tempHtmlPath = join(__dirname, '.tmp-invoice.html');
  fs.writeFileSync(tempHtmlPath, html, 'utf-8');

  try {
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.default.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto('file://' + tempHtmlPath, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputFilePath,
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    });
    await browser.close();
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
}

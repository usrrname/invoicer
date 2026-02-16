/**
 * Builds semantic HTML for the invoice. No styling — only structure and data.
 * Styling is entirely in styles.css.
 *
 * @param {Invoice} invoice
 * @param {{ lineItemsTotal: number, expensesTotal: number, total: number }} totals
 * @returns {string} HTML document string
 */
export function buildInvoiceHtml(invoice, totals) {
  const { lineItemsTotal, expensesTotal, total } = totals;

  const lineItemsRows = invoice.lineItems
    .map(
      (item) => `
    <tr>
      <td>${escapeHtml(item.description ?? '')}</td>
      <td>${escapeHtml(String(item.date ?? ''))}</td>
      <td>${escapeHtml(String(item.hours ?? ''))}</td>
      <td>${formatAmount(item.amount)}</td>
    </tr>`
    )
    .join('');

  const expensesRows =
    Array.isArray(invoice.expenses) && invoice.expenses.length > 0
      ? invoice.expenses
          .map(
            (expense) => `
    <tr>
      <td>${escapeHtml(expense.date ?? '')}</td>
      <td>${escapeHtml(expense.name ?? '')}</td>
      <td>${escapeHtml(expense.description ?? '')}</td>
      <td>${formatAmount(expense.amount)}</td>
    </tr>`
          )
          .join('')
      : '';

  const payerBlock = [
    invoice.payer.name,
    invoice.payer.address,
    invoice.payer.telephone,
  ]
    .filter(Boolean)
    .join('<br>');
  const payeeBlock = [
    invoice.payee.name,
    invoice.payee.address,
    invoice.payee.telephone,
    invoice.payee.email,
  ]
    .filter(Boolean)
    .join('<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${escapeHtml(invoice.invoiceId)}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h2>Invoice #${escapeHtml(invoice.invoiceId)}</h2>

  <table class="invoice-addresses">
    <tbody>
      <tr>
        <td><strong>To:</strong><br>${payerBlock}</td>
        <td><strong>From:</strong><br>${payeeBlock}</td>
      </tr>
    </tbody>
  </table>

  <h3>Line Items</h3>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Date</th>
        <th>Hours</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
${lineItemsRows}
    </tbody>
  </table>

  <h3>Expenses</h3>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Name</th>
        <th>Description</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
${expensesRows || '      <tr><td colspan="4">—</td></tr>'}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3">Total Expenses</td>
        <td>${expensesTotal > 0 ? formatAmount(expensesTotal) : '—'}</td>
      </tr>
      <tr>
        <td colspan="3">Total</td>
        <td>${formatAmount(total)}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;
}

function escapeHtml(str) {
  if (str == null) return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatAmount(value) {
  const n = Number(value);
  return isNaN(n) ? '—' : '$' + n.toFixed(2);
}

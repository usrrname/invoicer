/**
 * Builds semantic HTML for the invoice. No styling — only structure and data.
 * Styling is entirely in styles.css.
 *
 * Amount due for services is serviceTotal. Tax and total-with-tax rows live in the Line Items
 * table (rowType tax | serviceTotal). With no embedded service-total row, a tfoot total is shown.
 * Expenses are listed for reference; grand total includes service + expenses.
 *
 * @param {Invoice} invoice
 * @param {{ serviceTotal: number, expensesTotal: number, grandTotal: number, showTableFooter: boolean }} totals
 * @returns {string} HTML document string
 */
export function buildInvoiceHtml(invoice, totals) {
  const { serviceTotal, expensesTotal, grandTotal, showTableFooter } = totals;

  const lineItemsRows = invoice.lineItems
    .map((item) => {
      const rowClass =
        item.rowType === 'tax'
          ? ' class="line-item-tax"'
          : item.rowType === 'serviceTotal'
            ? ' class="line-item-service-total"'
            : '';
      return `
    <tr${rowClass}>
      <td>${escapeHtml(item.description ?? '')}</td>
      <td>${escapeHtml(String(item.date ?? ''))}</td>
      <td>${escapeHtml(String(item.hours ?? ''))}</td>
      <td>${formatAmount(item.amount)}</td>
    </tr>`;
    })
    .join('');

  const lineItemsTfootInner = showTableFooter
    ? `
      <tr>
        <td colspan="3">Total (including HST/GST)</td>
        <td>${formatAmount(serviceTotal)}</td>
      </tr>`
    : '';

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
    </tbody>${showTableFooter ? `
    <tfoot>${lineItemsTfootInner}
    </tfoot>` : ''}
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
      <tr class="grand-total-row">
        <td colspan="3">Grand total</td>
        <td>${formatAmount(grandTotal)}</td>
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

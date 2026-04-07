/**
 * Rounds a number to 2 decimal places
 * @param {number} value - The value to round
 * @returns {number} The rounded value
 */
function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

/** Ontario HST / GST rate applied when row 2 is a tax row (13% of row 1 amount). */
const HST_GST_RATE = 0.13;

/**
 * Calculates totals from line items and expenses, and validates against explicit totals if provided.
 * @param {Invoice} invoice - The invoice object with lineItems and expenses populated
 * @param {number|null} explicitExpensesTotal - Optional explicit expenses total from markdown
 * @param {number|null} explicitGrandTotal - Optional explicit grand total from markdown
 * @returns {Invoice} The invoice object with calculated totals added
 * @throws {Error} If explicit totals don't match calculated sums
 */
export function calculateAndValidateTotals(invoice, explicitExpensesTotal, explicitGrandTotal) {
  const lineRows = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];

  if (lineRows.length >= 2) {
    const first = lineRows[0];
    const second = lineRows[1];
    if (
      second.rowType === 'tax' &&
      (!first.rowType || first.rowType === 'item')
    ) {
      const firstAmount = parseFloat(first.amount) || 0;
      const expectedTax = roundToTwoDecimals(firstAmount * HST_GST_RATE);
      const actualTax = roundToTwoDecimals(parseFloat(second.amount) || 0);
      if (Math.abs(expectedTax - actualTax) >= 0.01) {
        throw new Error(
          `Second line (tax) amount (${actualTax}) must equal 13% of the first line (${expectedTax}, from ${firstAmount}).`
        );
      }
    }
  }

  const itemSubtotal = lineRows
    .filter((row) => !row.rowType || row.rowType === 'item')
    .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
  const calculatedTaxTotal = lineRows
    .filter((row) => row.rowType === 'tax')
    .reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
  const computedServiceFromParts = itemSubtotal + calculatedTaxTotal;

  let calculatedServiceTotal;
  if (invoice.embeddedServiceTotal != null) {
    calculatedServiceTotal = parseFloat(String(invoice.embeddedServiceTotal)) || 0;
    const roundedEmbedded = roundToTwoDecimals(calculatedServiceTotal);
    const roundedComputed = roundToTwoDecimals(computedServiceFromParts);
    if (Math.abs(roundedEmbedded - roundedComputed) >= 0.01) {
      throw new Error(
        `Service total (written: ${invoice.embeddedServiceTotal}) does not match subtotal + tax (${roundedComputed}).`
      );
    }
  } else {
    calculatedServiceTotal = computedServiceFromParts;
  }

  const calculatedLineItemsTotal = itemSubtotal;
  const calculatedExpensesTotal = invoice.expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
  const calculatedGrandTotal = calculatedServiceTotal + calculatedExpensesTotal;

  // Round all calculated totals to 2 decimal places
  const roundedLineItemsTotal = roundToTwoDecimals(calculatedLineItemsTotal);
  const roundedTaxTotal = roundToTwoDecimals(calculatedTaxTotal);
  const roundedServiceTotal = roundToTwoDecimals(calculatedServiceTotal);
  const roundedExpensesTotal = roundToTwoDecimals(calculatedExpensesTotal);
  const roundedGrandTotal = roundToTwoDecimals(calculatedGrandTotal);

  // Store calculated totals on invoice object
  invoice.totalLineItems = roundedLineItemsTotal;
  invoice.totalTax = roundedTaxTotal;
  invoice.serviceTotal = roundedServiceTotal;
  invoice.totalExpenses = roundedExpensesTotal;
  invoice.calculatedTotal = roundedGrandTotal;

  // Validate expenses total if explicit value is provided
  if (explicitExpensesTotal !== null) {
    const roundedExplicitExpenses = roundToTwoDecimals(explicitExpensesTotal);
    const difference = Math.abs(roundedExplicitExpenses - roundedExpensesTotal);
    if (difference >= 0.01) {
      throw new Error(`Expenses total (written: ${explicitExpensesTotal}) does not match calculated sum (${roundedExpensesTotal}).`);
    }
  }

  // Validate grand total if explicit value is provided
  if (explicitGrandTotal !== null) {
    const roundedExplicitGrand = roundToTwoDecimals(explicitGrandTotal);
    const difference = Math.abs(roundedExplicitGrand - roundedGrandTotal);
    if (difference >= 0.01) {
      throw new Error(`Grand total (written: ${explicitGrandTotal}) does not match calculated sum (${roundedGrandTotal}).`);
    }
  }

  return invoice;
}

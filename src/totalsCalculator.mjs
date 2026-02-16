/**
 * Rounds a number to 2 decimal places
 * @param {number} value - The value to round
 * @returns {number} The rounded value
 */
function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Calculates totals from line items and expenses, and validates against explicit totals if provided.
 * @param {Invoice} invoice - The invoice object with lineItems and expenses populated
 * @param {number|null} explicitExpensesTotal - Optional explicit expenses total from markdown
 * @param {number|null} explicitGrandTotal - Optional explicit grand total from markdown
 * @returns {Invoice} The invoice object with calculated totals added
 * @throws {Error} If explicit totals don't match calculated sums
 */
export function calculateAndValidateTotals(invoice, explicitExpensesTotal, explicitGrandTotal) {
  // Calculate totals from line items and expenses
  const calculatedLineItemsTotal = invoice.lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const calculatedExpensesTotal = invoice.expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
  const calculatedGrandTotal = calculatedLineItemsTotal + calculatedExpensesTotal;

  // Round all calculated totals to 2 decimal places
  const roundedLineItemsTotal = roundToTwoDecimals(calculatedLineItemsTotal);
  const roundedExpensesTotal = roundToTwoDecimals(calculatedExpensesTotal);
  const roundedGrandTotal = roundToTwoDecimals(calculatedGrandTotal);

  // Store calculated totals on invoice object
  invoice.totalLineItems = roundedLineItemsTotal;
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

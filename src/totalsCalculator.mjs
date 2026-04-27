import { hourlyRateForDescription } from './billingRates.mjs';
import { roundToTwoDecimals } from './utils/formatting.mjs';

/** Ontario HST / GST rate: each tax row must equal 13% of taxable subtotal (sum of line amounts above that row). */
const HST_GST_RATE = 0.13;

/**
 * @param {{ rowType?: string }} row
 * @returns {boolean}
 */
function isTaxableLineRow(row) {
  return row.rowType !== 'tax' && row.rowType !== 'serviceTotal';
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
  const lineRows = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];

  for (const row of lineRows) {
    if (!isTaxableLineRow(row)) continue;
    const hours = parseFloat(String(row.hours)) || 0;
    if (hours <= 0) continue;
    const explicitRate = parseFloat(String(row.hourlyRate));
    const rate =
      Number.isFinite(explicitRate) && explicitRate > 0
        ? explicitRate
        : hourlyRateForDescription(row.description ?? '');
    const expectedAmount = roundToTwoDecimals(hours * rate);
    const actualAmount = roundToTwoDecimals(parseFloat(row.amount) || 0);
    if (Math.abs(expectedAmount - actualAmount) >= 0.01) {
      const label = (row.description ?? '').trim() || '(line item)';
      throw new Error(
        `Line item "${label}": amount (${actualAmount}) must equal hours × rate (${hours} × ${rate} = ${expectedAmount}).`
      );
    }
  }

  for (let i = 0; i < lineRows.length; i++) {
    const row = lineRows[i];
    if (row.rowType !== 'tax') continue;

    const taxableSubtotal = lineRows
      .slice(0, i)
      .filter(isTaxableLineRow)
      .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
    const expectedTax = roundToTwoDecimals(taxableSubtotal * HST_GST_RATE);
    const actualTax = roundToTwoDecimals(parseFloat(row.amount) || 0);
    if (Math.abs(expectedTax - actualTax) >= 0.01) {
      throw new Error(
        `Tax row amount (${actualTax}) must equal 13% of taxable subtotal (${expectedTax}, from ${roundToTwoDecimals(taxableSubtotal)}).`
      );
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
  if (explicitExpensesTotal != null) {
    const roundedExplicitExpenses = roundToTwoDecimals(explicitExpensesTotal);
    const difference = Math.abs(roundedExplicitExpenses - roundedExpensesTotal);
    if (difference >= 0.01) {
      throw new Error(`Expenses total (written: ${explicitExpensesTotal}) does not match calculated sum (${roundedExpensesTotal}).`);
    }
  }

  // Validate grand total if explicit value is provided
  if (explicitGrandTotal != null) {
    const roundedExplicitGrand = roundToTwoDecimals(explicitGrandTotal);
    const difference = Math.abs(roundedExplicitGrand - roundedGrandTotal);
    if (difference >= 0.01) {
      throw new Error(`Grand total (written: ${explicitGrandTotal}) does not match calculated sum (${roundedGrandTotal}).`);
    }
  }

  return invoice;
}

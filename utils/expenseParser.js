const DEFAULT_CURRENCY = process.env.DEFAULT_CURRENCY || 'USD';

/**
 * Parse an expense message into structured data
 * @param {string} message - The expense message to parse
 * @returns {Object|null} - The parsed expense or null if invalid
 */
function parseExpense(message) {
  // Trim the message to remove whitespace
  const text = message.trim();
  
  // Basic expense regex: amount + description + optional category
  // Supports formats like: 
  // - "20 lunch"
  // - "20 USD lunch"
  // - "20 lunch #food"
  // - "20 USD lunch #food"
  const expenseRegex = /^(\d+\.?\d*)\s+(?:([A-Z]{3})\s+)?(.+?)(?:\s+#(\w+))?$/i;
  
  const match = text.match(expenseRegex);
  
  if (!match) return null;
  
  const [, amountStr, currencyStr, description, category] = match;
  const amount = parseFloat(amountStr);
  const currency = currencyStr ? currencyStr.toUpperCase() : DEFAULT_CURRENCY;
  
  // Validate the parsed data
  if (isNaN(amount) || amount <= 0) return null;
  
  return {
    amount,
    currency,
    description: description.trim(),
    category: category ? category.toLowerCase() : null
  };
}

module.exports = { parseExpense };

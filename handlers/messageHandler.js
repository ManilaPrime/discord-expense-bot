const { addExpenseToSheet } = require('../services/sheetService');
const { parseExpense } = require('../utils/expenseParser');
const logger = require('../utils/logger');

const PREFIX = process.env.PREFIX || '!';

/**
 * Handle incoming messages and process expense commands
 * @param {Object} message - Discord message object
 */
async function handleMessage(message) {
  // Check if message is in DM or has the expense prefix
  const isDM = message.channel.type === 'DM';
  const isCommand = message.content.startsWith(PREFIX);
  
  // Process as an expense if it's a DM or starts with the expense command
  if (isDM || (isCommand && message.content.startsWith(`${PREFIX}expense`))) {
    const content = isCommand ? message.content.slice(PREFIX.length + 8).trim() : message.content;
    
    // Skip empty messages
    if (!content) return;
    
    try {
      // Parse the expense message
      const expense = parseExpense(content);
      
      if (!expense) {
        return message.reply(
          `I couldn't understand your expense. Please use a format like:\n` +
          `"20 lunch" or "12.50 uber #transportation"`
        );
      }
      
      // Add the expense to the sheet
      await addExpenseToSheet({
        ...expense,
        userId: message.author.id,
        username: message.author.username,
        timestamp: new Date().toISOString()
      });
      
      // Send confirmation
      await message.reply(
        `✅ Recorded expense: ${expense.amount} ${expense.currency} for "${expense.description}"` +
        (expense.category ? ` in category #${expense.category}` : '')
      );
      
      logger.info(`Expense recorded for ${message.author.username}: ${expense.amount} for ${expense.description}`);
    } catch (error) {
      logger.error('Error processing expense:', error);
      await message.reply('Sorry, there was an error recording your expense. Please try again.');
    }
  }
}

module.exports = { handleMessage };

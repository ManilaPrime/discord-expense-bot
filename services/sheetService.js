const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const fs = require('fs');
const logger = require('../utils/logger');

// Initialize auth
const getJwtClient = () => {
  try {
    const credentials = JSON.parse(
      fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')
    );
    
    return new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } catch (error) {
    logger.error('Error loading Google credentials:', error);
    throw new Error('Failed to load Google credentials');
  }
};

/**
 * Add an expense to the Google Sheet
 * @param {Object} expense - The expense object to add
 */
async function addExpenseToSheet(expense) {
  try {
    const jwtClient = getJwtClient();
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, jwtClient);
    
    // Load document and sheet
    await doc.loadInfo();
    
    // Get or create expenses sheet
    let sheet = doc.sheetsByTitle['Expenses'];
    if (!sheet) {
      // Create and format the sheet if it doesn't exist
      sheet = await doc.addSheet({
        title: 'Expenses',
        headerValues: [
          'Timestamp', 'User ID', 'Username', 'Amount', 'Currency', 
          'Description', 'Category', 'Date'
        ]
      });
      
      // Format the header
      await sheet.updateProperties({
        gridProperties: {
          frozenRowCount: 1
        }
      });
    }
    
    // Format the date for better readability
    const date = new Date(expense.timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    // Add the expense row
    await sheet.addRow({
      'Timestamp': expense.timestamp,
      'User ID': expense.userId,
      'Username': expense.username,
      'Amount': expense.amount,
      'Currency': expense.currency,
      'Description': expense.description,
      'Category': expense.category || 'Uncategorized',
      'Date': formattedDate
    });
    
    logger.info(`Added expense to sheet: ${expense.amount} ${expense.currency} for ${expense.description}`);
    return true;
  } catch (error) {
    logger.error('Error adding expense to sheet:', error);
    throw error;
  }
}

/**
 * Get summary data from the sheet
 * @param {string} userId - Discord user ID
 * @param {Object} options - Filter options
 */
async function getExpenseSummary(userId, options = {}) {
  try {
    const jwtClient = getJwtClient();
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, jwtClient);
    
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle['Expenses'];
    
    if (!sheet) {
      return { expenses: [], total: 0 };
    }
    
    // Load all rows
    const rows = await sheet.getRows();
    
    // Filter by user if provided
    let filteredRows = rows;
    if (userId) {
      filteredRows = rows.filter(row => row['User ID'] === userId);
    }
    
    // Further filtering based on options
    if (options.category) {
      filteredRows = filteredRows.filter(row => 
        row['Category'].toLowerCase() === options.category.toLowerCase()
      );
    }
    
    if (options.startDate) {
      const startDate = new Date(options.startDate);
      filteredRows = filteredRows.filter(row => new Date(row['Timestamp']) >= startDate);
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      filteredRows = filteredRows.filter(row => new Date(row['Timestamp']) <= endDate);
    }
    
    // Convert to expense objects
    const expenses = filteredRows.map(row => ({
      timestamp: row['Timestamp'],
      username: row['Username'],
      amount: parseFloat(row['Amount']),
      currency: row['Currency'],
      description: row['Description'],
      category: row['Category']
    }));
    
    // Calculate total (assuming same currency for simplicity)
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return { expenses, total };
  } catch (error) {
    logger.error('Error getting expense summary:', error);
    throw error;
  }
}

module.exports = { addExpenseToSheet, getExpenseSummary };

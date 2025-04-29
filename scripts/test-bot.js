/**
 * Manual testing script for Discord Expense Tracker Bot
 * This script provides a console interface to simulate interactions with the bot
 */
require('dotenv').config();
const readline = require('readline');
const { parseExpense } = require('../utils/expenseParser');
const { addExpenseToSheet } = require('../services/sheetService');
const { createNewSheet, validateSheetAccess } = require('../services/sheetService');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Simulate the Discord user object
const testUser = {
  id: 'test-user-123',
  username: 'TestUser'
};

console.log('=== Discord Expense Tracker Bot - Test Console ===');
console.log('This utility helps you test bot functionality without Discord');
console.log('\nAvailable commands:');
console.log('1. add <expense> - Test adding an expense (e.g., "add 20 lunch")');
console.log('2. setup create - Test creating a new sheet');
console.log('3. setup link <sheet-id> - Test linking an existing sheet');
console.log('4. parse <message> - Test expense parsing only (no database update)');
console.log('5. exit - Exit the test console');
console.log('\n');

function processCommand(input) {
  const parts = input.trim().split(' ');
  const command = parts[0].toLowerCase();

  if (command === 'exit') {
    console.log('Exiting test console...');
    rl.close();
    process.exit(0);
  } else if (command === 'add') {
    const expenseText = parts.slice(1).join(' ');
    testAddExpense(expenseText);
  } else if (command === 'setup') {
    const subCommand = parts[1]?.toLowerCase();
    
    if (subCommand === 'create') {
      testCreateSheet();
    } else if (subCommand === 'link' && parts[2]) {
      testLinkSheet(parts[2]);
    } else {
      console.log('Invalid setup command. Use "setup create" or "setup link <sheet-id>"');
    }
  } else if (command === 'parse') {
    const message = parts.slice(1).join(' ');
    testParseExpense(message);
  } else {
    console.log('Unknown command. Try "add", "setup", "parse", or "exit"');
  }
}

async function testAddExpense(expenseText) {
  console.log(`\nTesting expense add: "${expenseText}"`);
  
  try {
    // Parse the expense
    const expense = parseExpense(expenseText);
    
    if (!expense) {
      console.log('❌ Failed to parse expense. Use format: "20 lunch" or "15.50 coffee #drinks"');
      return;
    }

    console.log('Parsed expense:');
    console.log(expense);
    
    // Check if sheet ID is configured
    if (!process.env.GOOGLE_SHEETS_ID) {
      console.log('⚠️ No Google Sheet configured. Run setup first.');
      return;
    }
    
    // Confirm before adding to sheet
    rl.question('Add this expense to sheet? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y') {
        try {
          // Add to sheet with test user info
          await addExpenseToSheet({
            ...expense,
            userId: testUser.id,
            username: testUser.username,
            timestamp: new Date().toISOString()
          });
          
          console.log('✅ Expense added successfully to sheet!');
        } catch (error) {
          console.error('❌ Error adding expense:', error.message);
        }
      } else {
        console.log('Operation cancelled.');
      }
    });
  } catch (error) {
    console.error('❌ Error processing expense:', error.message);
  }
}

async function testCreateSheet() {
  console.log('\nTesting sheet creation...');
  
  try {
    const sheetName = `Test Expense Sheet ${new Date().toLocaleTimeString()}`;
    console.log(`Creating sheet: ${sheetName}`);
    
    const result = await createNewSheet(sheetName);
    
    console.log('✅ Sheet created successfully!');
    console.log('Sheet ID:', result.spreadsheetId);
    console.log('Sheet URL:', result.spreadsheetUrl);
    
    // Update the .env in memory
    process.env.GOOGLE_SHEETS_ID = result.spreadsheetId;
    console.log('Environment updated with new Sheet ID');
    
  } catch (error) {
    console.error('❌ Error creating sheet:', error.message);
  }
}

async function testLinkSheet(sheetId) {
  console.log(`\nTesting linking to sheet: ${sheetId}`);
  
  try {
    const result = await validateSheetAccess(sheetId);
    
    if (result.success) {
      console.log('✅ Sheet linked successfully!');
      console.log('Sheet Title:', result.title);
      console.log('Sheet URL:', result.url);
      
      // Update the .env in memory
      process.env.GOOGLE_SHEETS_ID = sheetId;
      console.log('Environment updated with Sheet ID');
    } else {
      console.error('❌ Sheet validation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error linking sheet:', error.message);
  }
}

function testParseExpense(message) {
  console.log(`\nTesting expense parsing: "${message}"`);
  
  const expense = parseExpense(message);
  
  if (expense) {
    console.log('✅ Successfully parsed:');
    console.log('Amount:', expense.amount);
    console.log('Currency:', expense.currency);
    console.log('Description:', expense.description);
    console.log('Category:', expense.category || 'None');
  } else {
    console.log('❌ Failed to parse expense. Format should be like:');
    console.log('- "20 lunch"');
    console.log('- "15.50 EUR coffee"');
    console.log('- "30 dinner #food"');
  }
}

// Start the interactive console
rl.setPrompt('expense-bot> ');
rl.prompt();

rl.on('line', (line) => {
  processCommand(line.trim());
  rl.prompt();
}).on('close', () => {
  console.log('Test console closed.');
  process.exit(0);
});

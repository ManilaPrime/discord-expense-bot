# Testing the Expense Tracker Bot

This document outlines how to test your Discord expense tracking bot both manually and with automated tests.

## Prerequisites

- Node.js installed (v16 or higher)
- Bot tokens and credentials properly set up in your `.env` file
- Google service account credentials file (`credentials.json`)

## Setup for Testing

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure your environment variables are properly set in `.env`:
   - `DISCORD_TOKEN`: Your Discord bot token
   - `CLIENT_ID`: Your Discord application client ID
   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your Google service account JSON file

## Manual Testing Plan

### 1. Basic Bot Functionality

- **Bot Startup**
  - Run `npm run dev` to start the bot in development mode
  - Verify the bot comes online in Discord
  - Check console logs for successful connection

- **Setup Testing**
  - Run `/setup create` to create a new Google Sheet
  - Verify the sheet is created and the link is returned
  - Run `/setup link [sheet-id]` with an existing sheet ID
  - Verify the bot connects to the existing sheet

### 2. Expense Tracking

- **Adding Expenses (Direct Message)**
  - Send a DM to the bot: `20 lunch`
  - Verify the bot confirms the expense was added
  - Check the Google Sheet to confirm the entry was added

- **Adding Expenses (Command)**
  - In a server, type `!expense 15.50 coffee`
  - Verify the bot confirms the expense was added
  - Try adding with a category: `!expense 25 dinner #food`
  - Try adding with a currency: `!expense 30 EUR taxi #travel`

### 3. Reporting and Visualization

- **Summary Command**
  - Run `/summary` with different period options
  - Verify the summary shows correct totals and categories

- **Visualization Command**
  - Run `/visualize type:pie-category period:month`
  - Verify the chart is generated and displays correctly
  - Test each chart type:
    - `/visualize type:bar-weekly period:month`
    - `/visualize type:line-monthly period:year`
    - `/visualize type:bar-category period:all`

### 4. Error Handling

- **Invalid Commands**
  - Try entering an invalid expense format
  - Verify the bot provides a helpful error message
  - Try visualizing when no expenses exist
  - Verify appropriate error handling

## Automated Testing

Run the automated test suite:
```
npm test
```

This will run the Jest tests defined in the `test` directory.

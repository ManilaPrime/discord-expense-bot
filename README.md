# Expense Tracker Discord Bot

A Discord bot that allows users to track their expenses by sending messages, which are then saved to a Google Sheet.

## Features

- Record expenses via direct messages or commands
- Categorize expenses with hashtags
- View expense summaries by time period and category
- Visualize expenses with charts
- Integration with Google Sheets for data storage

## Setup

### Prerequisites

- Node.js (v16 or higher)
- A Discord account and application
- A Google account with Google Sheets access

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" tab and click "Add Bot"
4. Copy the token for later use
5. Enable the MESSAGE CONTENT intent under "Privileged Gateway Intents"
6. Go to OAuth2 > URL Generator:
   - Select scopes: `bot`, `applications.commands`
   - Select permissions: `Send Messages`, `Read Messages/View Channels`, `Use Slash Commands`
   - Copy and open the generated URL to invite the bot to your server

### Google Sheets Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Sheets API and Google Drive API
4. Create service account credentials:
   - Go to "Credentials" > "Create Credentials" > "Service Account"
   - Fill out the required information
   - Grant the service account the "Editor" role
   - Create a key in JSON format and download it
5. Place the downloaded credentials file in your project directory as `credentials.json`

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
   If you encounter dependency issues, use:
   ```
   npm install --legacy-peer-deps
   ```
3. Create a `.env` file with the following variables:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
   PREFIX=!
   DEFAULT_CURRENCY=USD
   TIMEZONE=America/New_York
   ```
4. Start the bot:
   ```
   npm start
   ```

## Using the Bot

### First-Time Setup

When you first start the bot, you'll need to set up a Google Sheet:

1. Use the `/setup create` command to create a new sheet
   - The sheet will be publicly viewable by default (but not editable)
   - Use `/setup create public:false` if you want a private sheet

2. Alternatively, link an existing sheet:
   - Share your Google Sheet with the service account email from your credentials.json file
   - Use `/setup link sheet_id:YOUR_SHEET_ID` to connect it

### Accessing Your Sheet

- **Public Sheets**: Click the link provided by the bot after setup
- **Private Sheets**: You'll need to:
  1. Request access using your Google account
  2. Share the sheet from your Google account with the bot's service account (from credentials.json)

### Recording Expenses

You can record expenses in two ways:

1. Direct Message: Just send the amount and description to the bot
   ```
   20 lunch
   ```

2. Server Command: Type `!expense` followed by the amount and description
   ```
   !expense 15.50 coffee
   ```

Add categories using hashtags:
```
25 dinner #food
```

Specify currency (default is USD):
```
30 EUR taxi #travel
```

### Viewing Expense Reports

- `/summary` - Get a summary of your expenses
- `/visualize` - Generate charts of your spending patterns

## License

MIT

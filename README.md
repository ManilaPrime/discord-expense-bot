# Expense Tracker Discord Bot

A Discord bot that allows users to track their expenses by sending messages, which are then saved to a Google Sheet.

## Features

- Record expenses via direct messages or commands
- Categorize expenses with hashtags
- View expense summaries by time period and category
- Visualize expenses with multiple chart types
- Automatic Google Sheet creation or linking
- Public or private sheet options
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
   npm install --legacy-peer-deps
   ```
   
   If you encounter specific Chart.js dependency issues, you can use the included fix script:
   ```
   chmod +x scripts/install-fix.sh
   ./scripts/install-fix.sh
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
  2. Share the sheet from your Google account with the bot's service account email
  3. The service account email can be found in your credentials.json file as "client_email"

### Recording Expenses

You can record expenses in two ways:

1. **Direct Message**: Just send the amount and description to the bot
   ```
   20 lunch
   ```

2. **Server Command**: Type `!expense` followed by the amount and description
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
  - Options: period (today, week, month, year, all)
  - Filter by category

- `/visualize` - Generate charts of your spending patterns
  - **Chart Types**:
    - `pie-category` - Pie chart showing expense distribution by category
    - `bar-weekly` - Bar chart showing expenses by week
    - `line-monthly` - Line chart showing monthly expense trends
    - `bar-category` - Horizontal bar chart comparing category expenses
  - Options: period (week, month, year, all)

### Help and Documentation

- `/help` - Shows detailed help information about using the bot

## Testing

The bot includes several tools to help with testing:

### Automated Tests

Run the automated test suite:
```
npm test
```

### Manual Testing

Test the bot without Discord:
```
npm run test:bot
```

This opens an interactive console where you can:
- Test expense parsing with `parse 20 lunch`
- Create a test sheet with `setup create`
- Add test expenses with `add 25 dinner #food`

### Verify Configuration

Check your environment and credentials:
```
npm run test:config
```

## Troubleshooting

- **Discord Token Issues**: Make sure your token is correct and the bot is invited to your server
- **Google Sheets Access**: Verify your service account credentials have the right permissions
- **Chart Generation Errors**: If visualization fails, try testing with `node scripts/test-visualization.js`
- **Installation Problems**: Use the install-fix script to resolve dependency conflicts

## License

MIT

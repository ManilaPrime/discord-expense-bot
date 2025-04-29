# Expense Tracker Discord Bot

A Discord bot that allows users to track their expenses by sending messages, which are then saved to a Google Sheet.

## Features

- Record expenses via direct messages or commands
- Categorize expenses with hashtags
- View expense summaries by time period and category
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
3. Enable the Google Sheets API
4. Create service account credentials:
   - Go to "Credentials" > "Create Credentials" > "Service Account"
   - Fill out the required information
   - Grant the service account the "Editor" role
   - Create a key in JSON format and download it
5. Create a new Google Sheet
6. Share the sheet with the email address of your service account (with Editor access)
7. Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)

### Project Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_discord_client_id
   GUILD_ID=your_discord_guild_id
   GOOGLE_SHEETS_ID=your_google_sheet_id
   GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
   PREFIX=!
   DEFAULT_CURRENCY=USD
   TIMEZONE=America/New_York
   ```
4. Place your Google service account JSON file in the project root and rename it to `credentials.json`
5. Start the bot:
   ```
   npm start
   ```

## Usage

### Recording Expenses

You can record expenses in two ways:

1. Send a direct message to the bot with your expense:
   ```
   20 lunch
   ```

2. Use the command in any channel:
   ```
   !expense 20 lunch
   ```

### Expense Format

The basic format is:
```
amount [currency] description [#category]
```

Examples:
- `20 lunch` - Records $20 spent on lunch
- `12.50 EUR coffee` - Records €12.50 spent on coffee
- `35.99 new headphones #electronics` - Records with category

### Commands

- `/help` - Shows help information
- `/summary` - Shows expense summary with options for time period and category filtering

## Deployment

For production deployment, consider using a service like:
- [Heroku](https://heroku.com)
- [Railway](https://railway.app)
- [DigitalOcean](https://digitalocean.com)

Remember to set the environment variables on your hosting platform.

## License

MIT

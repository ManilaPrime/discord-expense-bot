# Expense Tracker Bot Deployment Guide

This guide will help you deploy your Discord Expense Tracker Bot to a production environment.

## Prerequisites

- Git repository with your bot code
- Node.js hosting environment (VPS, Heroku, Railway, etc.)
- Discord bot token
- Google service account credentials

## Deployment Options

### Option 1: Hosting on a VPS (DigitalOcean, AWS, etc.)

1. **Set up your server**:
   ```bash
   # Update packages
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js and npm
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

2. **Clone your repository**:
   ```bash
   git clone https://github.com/yourusername/expense-tracker-bot.git
   cd expense-tracker-bot
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   nano .env
   # Edit the values with your actual credentials
   ```

4. **Install dependencies and start**:
   ```bash
   npm install --legacy-peer-deps
   pm2 start index.js --name "expense-bot"
   pm2 save
   pm2 startup
   ```

5. **Monitor your bot**:
   ```bash
   pm2 logs expense-bot
   pm2 monit
   ```

### Option 2: Hosting on Heroku

1. **Create a Heroku account and install the CLI**
2. **Create a new Heroku app**:
   ```bash
   heroku create your-expense-bot
   ```

3. **Add environment variables**:
   ```bash
   heroku config:set DISCORD_TOKEN=your_token
   heroku config:set CLIENT_ID=your_client_id
   # Add other required environment variables
   ```

4. **Create a credentials JSON file**:
   Since Heroku doesn't support file storage, you'll need to:
   - Create a `credentials.js` file that exports your credentials JSON
   - Update your bot code to use this module instead of reading a file

5. **Configure for Heroku**:
   Create a `Procfile` with:
   ```
   worker: node index.js
   ```

6. **Deploy to Heroku**:
   ```bash
   git push heroku main
   heroku ps:scale worker=1
   ```

### Option 3: Hosting on Railway

1. **Create a Railway account**
2. **Create a new project and link your GitHub repository**
3. **Add environment variables in the Railway dashboard**
4. **Deploy your application**

## Setting Up Continuous Deployment

For all hosting options, consider setting up a CI/CD pipeline:

1. **Create a GitHub Actions workflow**:
   ```yaml
   name: Deploy Bot

   on:
     push:
       branches: [ main ]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Use Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '16'
         - run: npm ci
         - run: npm test
         # Add deployment steps specific to your hosting platform
   ```

## Securing Production Credentials

1. **Never commit credentials to your repository**
2. **Use environment variables for sensitive information**
3. **Rotate credentials periodically**
4. **Use a `.gitignore` file to exclude sensitive files**

## Monitoring and Maintenance

1. **Set up logging**:
   - The bot already uses Winston for logging
   - Consider integrating with a service like Loggly or Papertrail

2. **Set up monitoring**:
   - For VPS: Use PM2 monitoring or a service like UptimeRobot
   - For Heroku: Use Heroku's built-in monitoring
   - For Railway: Railway provides built-in logging and monitoring

3. **Regular backups**:
   - Back up your Google Sheets data periodically
   - Consider exporting the data to CSV files

4. **Updates**:
   - Regularly update dependencies to prevent security issues
   - Test updates in a staging environment first

## Troubleshooting Production Issues

- **Bot goes offline**: Check your hosting platform's logs
- **Google API errors**: Verify API quotas and credentials
- **Discord API errors**: Check your bot token and permissions
- **Memory issues**: Monitor your application's memory usage

## Scaling Considerations

If your bot grows to serve many users:

1. **Database**: Consider moving from Google Sheets to a dedicated database
2. **Caching**: Implement caching for frequently accessed data
3. **Sharding**: If your bot reaches many servers, implement Discord sharding

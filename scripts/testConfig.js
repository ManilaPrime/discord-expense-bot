/**
 * Configuration validation tool
 * Tests environment variables and Google credentials
 */
require('dotenv').config();
const fs = require('fs');
const { JWT } = require('google-auth-library');
const chalk = require('chalk');

// Define required environment variables
const requiredEnvVars = {
  DISCORD_TOKEN: 'Your Discord bot token',
  CLIENT_ID: 'Your Discord application client ID',
  GOOGLE_APPLICATION_CREDENTIALS: 'Path to your Google credentials file'
};

// Optional environment variables
const optionalEnvVars = {
  GOOGLE_SHEETS_ID: 'Google Sheets ID (will create one if not provided)',
  GUILD_ID: 'Discord server ID (for development)',
  PREFIX: 'Command prefix (defaults to "!")',
  DEFAULT_CURRENCY: 'Default currency (defaults to "USD")',
  TIMEZONE: 'Your timezone (defaults to "America/New_York")'
};

console.log(chalk.blue.bold('=== Discord Expense Tracker Bot - Configuration Test ===\n'));

// Check environment variables
console.log(chalk.yellow.bold('Environment Variables:'));
let missingRequired = false;

for (const [key, description] of Object.entries(requiredEnvVars)) {
  if (!process.env[key]) {
    console.log(`  ${chalk.red('✘')} ${chalk.white(key)}: Missing (${description})`);
    missingRequired = true;
  } else {
    // Mask sensitive data
    const value = key === 'DISCORD_TOKEN' 
      ? `${process.env[key].substring(0, 10)}...` 
      : process.env[key];
    console.log(`  ${chalk.green('✓')} ${chalk.white(key)}: ${value}`);
  }
}

for (const [key, description] of Object.entries(optionalEnvVars)) {
  if (!process.env[key]) {
    console.log(`  ${chalk.yellow('⚠')} ${chalk.white(key)}: Not set (${description})`);
  } else {
    console.log(`  ${chalk.green('✓')} ${chalk.white(key)}: ${process.env[key]}`);
  }
}

if (missingRequired) {
  console.log(chalk.red('\nMissing required environment variables. Please check your .env file.'));
  process.exit(1);
}

// Test Google credentials
console.log('\n' + chalk.yellow.bold('Google Credentials:'));

try {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!fs.existsSync(credentialsPath)) {
    console.log(`  ${chalk.red('✘')} Credentials file not found at ${credentialsPath}`);
    process.exit(1);
  }
  
  console.log(`  ${chalk.green('✓')} Credentials file exists`);
  
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  
  if (!credentials.client_email || !credentials.private_key) {
    console.log(`  ${chalk.red('✘')} Credentials file is missing required fields`);
    process.exit(1);
  }
  
  console.log(`  ${chalk.green('✓')} Credentials format is valid`);
  console.log(`  ${chalk.green('✓')} Service account email: ${credentials.client_email}`);
  
  // Try to create a JWT client
  const jwtClient = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  
  console.log(`  ${chalk.green('✓')} JWT client created successfully`);
  
  // Optional: Test actual authentication
  if (process.argv.includes('--test-auth')) {
    console.log('  Testing authentication...');
    jwtClient.authorize((err, tokens) => {
      if (err) {
        console.log(`  ${chalk.red('✘')} Authentication failed: ${err.message}`);
        process.exit(1);
      }
      console.log(`  ${chalk.green('✓')} Authentication successful`);
    });
  }
  
} catch (error) {
  console.log(`  ${chalk.red('✘')} Error testing credentials: ${error.message}`);
  process.exit(1);
}

console.log('\n' + chalk.green.bold('✅ Configuration appears valid!'));
console.log(chalk.blue('You can now start the bot with "npm start" or "npm run dev"'));

require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { handleMessage } = require('./handlers/messageHandler');
const { setupCommands } = require('./handlers/commandHandler');
const logger = require('./utils/logger');

// Initialize Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Setup event handlers
client.once(Events.ClientReady, () => {
  logger.info(`Logged in as ${client.user.tag}`);
  setupCommands(client);
});

client.on(Events.MessageCreate, async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;
  
  try {
    await handleMessage(message);
  } catch (error) {
    logger.error('Error handling message:', error);
    message.reply('Sorry, there was an error processing your request. Please try again later.');
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
  } catch (error) {
    logger.error('Error handling command:', error);
    await interaction.reply({
      content: 'There was an error executing this command!',
      ephemeral: true
    });
  }
});

// Login with token
client.login(process.env.DISCORD_TOKEN);

// Handle process termination
process.on('SIGINT', () => {
  logger.info('Bot is shutting down...');
  client.destroy();
  process.exit(0);
});

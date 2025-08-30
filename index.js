require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Events, EmbedBuilder } = require('discord.js');
const { handleMessage } = require('./handlers/messageHandler');
const { setupCommands } = require('./handlers/commandHandler');
const logger = require('./utils/logger');

// ------------------- Minimal Web Server -------------------
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running!'));
app.listen(PORT, () => console.log(`Web server listening on port ${PORT}`));

// ------------------- Discord Client -------------------
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

  // Check if Google Sheets is configured
  if (!process.env.GOOGLE_SHEETS_ID) {
    logger.warn('Google Sheets ID not configured. Bot will prompt users to run setup.');
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  try {
    if (!process.env.GOOGLE_SHEETS_ID) {
      const isDM = message.channel.type === 'DM';
      const isMention = message.mentions.has(client.user);

      if (isDM || isMention) {
        const setupEmbed = new EmbedBuilder()
          .setTitle('⚙️ Setup Required')
          .setColor('#FFA500')
          .setDescription('Your expense tracker needs to be set up before you can start tracking expenses!')
          .addFields(
            { name: 'Option 1: Create a New Sheet', value: 'Use `/setup create` to automatically create a new Google Sheet.', inline: false },
            { name: 'Option 2: Link Your Own Sheet', value: 'Use `/setup link <sheet_id>` to connect an existing Google Sheet.', inline: false },
            { name: 'Need Help?', value: 'Type `/help` for more information on using this bot.', inline: false }
          )
          .setFooter({ text: 'You only need to do this setup once.' });

        return message.reply({ embeds: [setupEmbed] });
      }

      return;
    }

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

    if (!process.env.GOOGLE_SHEETS_ID && interaction.commandName !== 'setup' && interaction.commandName !== 'help') {
      return interaction.reply({
        content: 'Please set up your expense tracker first using the `/setup` command.',
        ephemeral: true
      });
    }

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


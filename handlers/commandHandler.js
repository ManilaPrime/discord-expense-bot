const { REST, Routes, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Setup slash commands for the bot
 * @param {Object} client - Discord client
 */
async function setupCommands(client) {
  client.commands = new Collection();
  const commands = [];
  
  // Load command files
  const commandsPath = path.join(__dirname, '../commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      logger.warn(`The command at ${filePath} is missing required "data" or "execute" property.`);
    }
  }
  
  // Register commands with Discord
  const rest = new REST().setToken(process.env.DISCORD_TOKEN);
  
  try {
    logger.info('Started refreshing application (/) commands.');
    
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    
    logger.info('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Error registering commands:', error);
  }
}

module.exports = { setupCommands };

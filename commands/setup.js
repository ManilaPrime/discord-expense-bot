const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { createNewSheet, validateSheetAccess } = require('../services/sheetService');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup your Google Sheet for expense tracking')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a new Google Sheet for tracking expenses')
        .addBooleanOption(option =>
          option.setName('public')
            .setDescription('Make the sheet publicly viewable (recommended)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('link')
        .setDescription('Link an existing Google Sheet')
        .addStringOption(option =>
          option.setName('sheet_id')
            .setDescription('The ID of your Google Sheet')
            .setRequired(true))),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Check if we already have a sheet configured
      const envPath = path.resolve(process.cwd(), '.env');
      const env = dotenv.config({ path: envPath }).parsed;
      
      if (env.GOOGLE_SHEETS_ID && interaction.options.getSubcommand() === 'create') {
        // Provide option to override
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('confirm_new_sheet')
              .setLabel('Create New Sheet')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('cancel_setup')
              .setLabel('Cancel')
              .setStyle(ButtonStyle.Secondary)
          );
        
        return interaction.editReply({
          content: 'You already have a Google Sheet configured. Creating a new one will replace your current setup. Would you like to continue?',
          components: [row]
        });
      }

      if (interaction.options.getSubcommand() === 'create') {
        // Get public option (defaults to true for better UX)
        const makePublic = interaction.options.getBoolean('public') ?? true;
        
        // Create a new sheet
        const sheetInfo = await createNewSheet(`Expense Tracker - ${interaction.user.username}`, makePublic);
        
        // Update .env file with the new sheet ID
        updateEnvFile('GOOGLE_SHEETS_ID', sheetInfo.spreadsheetId);
        
        // Create different embeds based on whether the sheet is public or private
        const embed = new EmbedBuilder()
          .setTitle('✅ New Expense Sheet Created')
          .setColor('#00FF00')
          .setDescription(`Your expense tracking sheet has been created successfully!`)
          .addFields(
            { name: 'Sheet Name', value: sheetInfo.spreadsheetUrl.split('/')[5], inline: true },
            { name: 'Sheet ID', value: sheetInfo.spreadsheetId, inline: true }
          );
          
        if (sheetInfo.isPublic) {
          embed.addFields({ 
            name: 'Access', 
            value: 'Your sheet is publicly viewable (but not editable). Anyone with the link can view it.'
          });
          embed.addFields({ 
            name: 'Link', 
            value: `[Open in Browser](${sheetInfo.spreadsheetUrl})`
          });
        } else {
          embed.addFields({ 
            name: 'Access', 
            value: `The sheet is private. You need to manually share it with your email to access it.`,
          });
          embed.addFields({ 
            name: 'How to Access', 
            value: `1. Copy the URL: ${sheetInfo.spreadsheetUrl}\n2. Open the URL in your browser\n3. Request access using your Google account\n4. The bot's service account (check credentials.json) will need to grant you access`
          });
        }
        
        embed.setFooter({ text: 'You can now start tracking your expenses!' });
        
        return interaction.editReply({ embeds: [embed], components: [] });
      } else {
        // Link existing sheet
        const sheetId = interaction.options.getString('sheet_id');
        
        // Validate the sheet ID and check permissions
        const validationResult = await validateSheetAccess(sheetId);
        
        if (validationResult.success) {
          // Update .env file with the provided sheet ID
          updateEnvFile('GOOGLE_SHEETS_ID', sheetId);
          
          const embed = new EmbedBuilder()
            .setTitle('✅ Google Sheet Linked')
            .setColor('#00FF00')
            .setDescription(`Your Google Sheet has been linked successfully!`)
            .addFields(
              { name: 'Sheet Name', value: validationResult.title, inline: true },
              { name: 'Sheet ID', value: sheetId, inline: true },
              { name: 'Link', value: `[Open in Browser](${validationResult.url})` },
              { name: 'Important Note', value: 'Make sure you have shared this sheet with the bot\'s service account email from credentials.json with Editor permissions' }
            )
            .setFooter({ text: 'You can now start tracking your expenses!' });
          
          return interaction.editReply({ embeds: [embed], components: [] });
        } else {
          return interaction.editReply({
            content: `❌ Error: ${validationResult.error}. Please make sure the bot's service account has access to the sheet.`,
            components: []
          });
        }
      }
    } catch (error) {
      logger.error('Error in setup command:', error);
      return interaction.editReply('An error occurred during setup. Please try again later.');
    }
  }
};

/**
 * Update a value in the .env file
 * @param {string} key - The key to update
 * @param {string} value - The new value
 */
function updateEnvFile(key, value) {
  const envPath = path.resolve(process.cwd(), '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (regex.test(envContent)) {
      // Update existing key
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new key
      envContent += `\n${key}=${value}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    
    // Also update process.env
    process.env[key] = value;
    
    logger.info(`Updated ${key} in .env file`);
  } catch (error) {
    logger.error('Error updating .env file:', error);
    throw error;
  }
}

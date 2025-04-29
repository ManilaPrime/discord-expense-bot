const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Learn how to use the expense tracker bot'),
    
  async execute(interaction) {
    const prefix = process.env.PREFIX || '!';
    
    const embed = new EmbedBuilder()
      .setTitle('💰 Expense Tracker Bot Help')
      .setColor('#0099ff')
      .setDescription('Track your expenses easily by sending messages to this bot.')
      .addFields(
        { 
          name: '📝 Recording Expenses', 
          value: `You can record expenses in two ways:
          1. Direct Message: Just send the amount and description to the bot.
          2. Server Command: Type \`${prefix}expense amount description\` in any channel.
          
          **Examples:**
          • \`20 lunch\` - Records $20 spent on lunch
          • \`12.50 EUR coffee\` - Records €12.50 spent on coffee
          • \`35.99 new headphones #electronics\` - Records with category`, 
          inline: false 
        },
        { 
          name: '🏷️ Using Categories', 
          value: `Add a hashtag followed by the category name:
          • \`30 dinner #food\`
          • \`25 gas #transportation\``, 
          inline: false 
        },
        { 
          name: '📊 Getting Summaries', 
          value: `Use \`/summary\` to see expense reports with these options:
          • Period: Today, This Week, This Month, This Year, All Time
          • Category: Filter by a specific category`, 
          inline: false 
        },
        { 
          name: '💡 Pro Tips', 
          value: `• Be consistent with categories for better reporting
          • You can add multiple expenses in succession
          • Use the summary command to track your spending habits`, 
          inline: false 
        }
      )
      .setFooter({ text: 'For more help or to report issues, contact the server admin.' });
    
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};

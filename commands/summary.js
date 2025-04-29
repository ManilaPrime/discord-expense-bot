const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getExpenseSummary } = require('../services/sheetService');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('summary')
    .setDescription('Get a summary of your expenses')
    .addStringOption(option =>
      option.setName('period')
        .setDescription('Time period for the summary')
        .setRequired(false)
        .addChoices(
          { name: 'Today', value: 'today' },
          { name: 'This Week', value: 'week' },
          { name: 'This Month', value: 'month' },
          { name: 'This Year', value: 'year' },
          { name: 'All Time', value: 'all' }
        ))
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Filter by expense category')
        .setRequired(false)),
        
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    
    try {
      const userId = interaction.user.id;
      const period = interaction.options.getString('period') || 'month';
      const category = interaction.options.getString('category');
      
      // Set up date filters based on period
      const options = { category };
      const now = new Date();
      
      if (period === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        options.startDate = today;
      } else if (period === 'week') {
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        options.startDate = startOfWeek;
      } else if (period === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        options.startDate = startOfMonth;
      } else if (period === 'year') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        options.startDate = startOfYear;
      }
      
      // Get the expense data
      const { expenses, total } = await getExpenseSummary(userId, options);
      
      if (expenses.length === 0) {
        return interaction.editReply('No expenses found for the selected period.');
      }
      
      // Group expenses by category
      const categories = {};
      expenses.forEach(expense => {
        const cat = expense.category || 'Uncategorized';
        if (!categories[cat]) {
          categories[cat] = 0;
        }
        categories[cat] += expense.amount;
      });
      
      // Create embed for the summary
      const embed = new EmbedBuilder()
        .setTitle('Expense Summary')
        .setColor('#0099ff')
        .setDescription(`Summary for: ${getPeriodText(period)}${category ? ` in category #${category}` : ''}`)
        .addFields(
          { name: 'Total Expenses', value: `${total.toFixed(2)} ${expenses[0].currency}`, inline: false },
          { name: 'Number of Expenses', value: `${expenses.length}`, inline: true },
          { name: 'Average per Expense', value: `${(total / expenses.length).toFixed(2)} ${expenses[0].currency}`, inline: true }
        )
        .setFooter({ text: `Generated on ${now.toLocaleDateString()}` });
      
      // Add category breakdown
      const categoryBreakdown = Object.entries(categories)
        .map(([name, amount]) => `**${name}**: ${amount.toFixed(2)} ${expenses[0].currency}`)
        .join('\n');
      
      embed.addFields({ name: 'Category Breakdown', value: categoryBreakdown, inline: false });
      
      await interaction.editReply({ embeds: [embed] });
      
    } catch (error) {
      logger.error('Error generating summary:', error);
      await interaction.editReply('There was an error generating your expense summary. Please try again later.');
    }
  }
};

/**
 * Get a human-readable description of the time period
 * @param {string} period - The period identifier
 * @returns {string} - Human readable period description
 */
function getPeriodText(period) {
  switch (period) {
    case 'today': return 'Today';
    case 'week': return 'This Week';
    case 'month': return 'This Month';
    case 'year': return 'This Year';
    case 'all': return 'All Time';
    default: return 'This Month';
  }
}

const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getExpenseSummary } = require('../services/sheetService');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const logger = require('../utils/logger');

// Configure chart canvas
const width = 800;
const height = 600;
const chartCallback = (ChartJS) => {
  ChartJS.defaults.font.family = 'Arial';
  ChartJS.defaults.font.size = 16;
  ChartJS.defaults.color = '#666';
};
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('visualize')
    .setDescription('Visualize your expense data with charts')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('The type of chart to generate')
        .setRequired(true)
        .addChoices(
          { name: 'Pie Chart - Categories', value: 'pie-category' },
          { name: 'Bar Chart - Weekly', value: 'bar-weekly' },
          { name: 'Line Chart - Monthly', value: 'line-monthly' },
          { name: 'Bar Chart - By Category', value: 'bar-category' }
        ))
    .addStringOption(option =>
      option.setName('period')
        .setDescription('Time period for the visualization')
        .setRequired(false)
        .addChoices(
          { name: 'This Week', value: 'week' },
          { name: 'This Month', value: 'month' },
          { name: 'This Year', value: 'year' },
          { name: 'All Time', value: 'all' }
        )),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      // Check if Google Sheets is configured
      if (!process.env.GOOGLE_SHEETS_ID) {
        return interaction.editReply({
          content: 'Please set up your expense sheet first using the `/setup` command.',
          ephemeral: true
        });
      }

      const userId = interaction.user.id;
      const chartType = interaction.options.getString('type');
      const period = interaction.options.getString('period') || 'month';

      // Get filter options based on period
      const options = getTimeFilterOptions(period);
      
      // Get expense data
      const { expenses } = await getExpenseSummary(userId, options);

      if (expenses.length === 0) {
        return interaction.editReply('No expenses found for the selected period.');
      }

      // Generate the appropriate chart
      let chartImage, chartTitle, chartDescription;
      
      switch (chartType) {
        case 'pie-category':
          ({ chartImage, chartTitle, chartDescription } = await generateCategoryPieChart(expenses, period));
          break;
        case 'bar-weekly':
          ({ chartImage, chartTitle, chartDescription } = await generateWeeklyBarChart(expenses, period));
          break;
        case 'line-monthly':
          ({ chartImage, chartTitle, chartDescription } = await generateMonthlyLineChart(expenses, period));
          break;
        case 'bar-category':
          ({ chartImage, chartTitle, chartDescription } = await generateCategoryBarChart(expenses, period));
          break;
        default:
          return interaction.editReply('Invalid chart type selected.');
      }

      // Create attachment from chart buffer
      const attachment = new AttachmentBuilder(chartImage, { name: 'expense-chart.png' });

      // Create embed with the chart
      const embed = new EmbedBuilder()
        .setTitle(chartTitle)
        .setColor('#0099ff')
        .setDescription(chartDescription)
        .setImage('attachment://expense-chart.png')
        .setFooter({ text: `Data from ${getPeriodText(period)} • Generated on ${new Date().toLocaleDateString()}` });

      await interaction.editReply({ embeds: [embed], files: [attachment] });

    } catch (error) {
      logger.error('Error generating visualization:', error);
      await interaction.editReply('There was an error generating your visualization. Please try again later.');
    }
  }
};

/**
 * Generate a pie chart showing expenses by category
 * @param {Array} expenses - Expense data
 * @param {string} period - Time period
 * @returns {Object} - Chart image buffer and metadata
 */
async function generateCategoryPieChart(expenses, period) {
  // Group expenses by category
  const categoryData = {};
  
  expenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += expense.amount;
  });

  // Prepare chart data
  const labels = Object.keys(categoryData);
  const data = Object.values(categoryData);
  
  // Generate random colors for each category
  const colors = labels.map(() => {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
  });

  const configuration = {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        hoverOffset: 4,
        borderWidth: 1,
        borderColor: '#fff'
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: `Expenses by Category - ${getPeriodText(period)}`,
          font: {
            size: 18
          }
        },
        legend: {
          position: 'right',
          labels: {
            padding: 20,
            boxWidth: 15
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      },
      layout: {
        padding: 20
      }
    }
  };

  // Generate chart
  const chartImage = await chartJSNodeCanvas.renderToBuffer(configuration);
  
  return {
    chartImage,
    chartTitle: 'Expense Breakdown by Category',
    chartDescription: `This chart shows how your expenses (${expenses.length} total) are distributed across different categories.`
  };
}

/**
 * Generate a bar chart showing weekly expenses
 * @param {Array} expenses - Expense data
 * @param {string} period - Time period
 * @returns {Object} - Chart image buffer and metadata
 */
async function generateWeeklyBarChart(expenses, period) {
  // Group expenses by week
  const weeklyData = {};
  
  expenses.forEach(expense => {
    const date = new Date(expense.timestamp);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = 0;
    }
    weeklyData[weekKey] += expense.amount;
  });

  // Sort weeks chronologically
  const sortedWeeks = Object.keys(weeklyData).sort();
  const weekLabels = sortedWeeks.map(date => {
    const weekDate = new Date(date);
    return `${weekDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  });
  
  const weekValues = sortedWeeks.map(week => weeklyData[week]);

  const configuration = {
    type: 'bar',
    data: {
      labels: weekLabels,
      datasets: [{
        label: 'Weekly Expenses',
        data: weekValues,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Week Starting'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: `Weekly Expenses - ${getPeriodText(period)}`,
          font: {
            size: 18
          }
        },
        legend: {
          display: false
        }
      }
    }
  };

  // Generate chart
  const chartImage = await chartJSNodeCanvas.renderToBuffer(configuration);
  
  return {
    chartImage,
    chartTitle: 'Weekly Expense Trends',
    chartDescription: `This chart shows your spending pattern week by week.`
  };
}

/**
 * Generate a line chart showing monthly expenses
 * @param {Array} expenses - Expense data
 * @param {string} period - Time period
 * @returns {Object} - Chart image buffer and metadata
 */
async function generateMonthlyLineChart(expenses, period) {
  // Group expenses by month
  const monthlyData = {};
  
  expenses.forEach(expense => {
    const date = new Date(expense.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    monthlyData[monthKey] += expense.amount;
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyData).sort();
  const monthLabels = sortedMonths.map(monthKey => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  });
  
  const monthValues = sortedMonths.map(month => monthlyData[month]);

  const configuration = {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [{
        label: 'Monthly Expenses',
        data: monthValues,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Total Amount'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Month'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: `Monthly Expenses - ${getPeriodText(period)}`,
          font: {
            size: 18
          }
        }
      }
    }
  };

  // Generate chart
  const chartImage = await chartJSNodeCanvas.renderToBuffer(configuration);
  
  return {
    chartImage,
    chartTitle: 'Monthly Expense Trends',
    chartDescription: `This line chart shows your monthly expense totals over time.`
  };
}

/**
 * Generate a bar chart comparing categories
 * @param {Array} expenses - Expense data
 * @param {string} period - Time period
 * @returns {Object} - Chart image buffer and metadata
 */
async function generateCategoryBarChart(expenses, period) {
  // Group expenses by category
  const categoryData = {};
  
  expenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += expense.amount;
  });

  // Sort categories by amount spent (descending)
  const sortedCategories = Object.entries(categoryData)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Limit to top 10 categories
  
  const categoryLabels = sortedCategories.map(entry => entry[0]);
  const categoryValues = sortedCategories.map(entry => entry[1]);
  
  // Generate random colors for categories
  const colors = categoryLabels.map(() => {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
  });

  const configuration = {
    type: 'bar',
    data: {
      labels: categoryLabels,
      datasets: [{
        label: 'Amount Spent',
        data: categoryValues,
        backgroundColor: colors,
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Category'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: `Top Categories by Spending - ${getPeriodText(period)}`,
          font: {
            size: 18
          }
        },
        legend: {
          display: false
        }
      }
    }
  };

  // Generate chart
  const chartImage = await chartJSNodeCanvas.renderToBuffer(configuration);
  
  return {
    chartImage,
    chartTitle: 'Top Spending Categories',
    chartDescription: `This horizontal bar chart shows your top spending categories for ${getPeriodText(period).toLowerCase()}.`
  };
}

/**
 * Get time filter options based on period
 * @param {string} period - The time period
 * @returns {Object} - Filter options
 */
function getTimeFilterOptions(period) {
  const options = {};
  const now = new Date();
  
  if (period === 'week') {
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
  
  return options;
}

/**
 * Get the start date of the week for a given date
 * @param {Date} date - The date
 * @returns {Date} - The start date of the week
 */
function getWeekStart(date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get a human-readable description of the time period
 * @param {string} period - The period identifier
 * @returns {string} - Human readable period description
 */
function getPeriodText(period) {
  switch (period) {
    case 'week': return 'This Week';
    case 'month': return 'This Month';
    case 'year': return 'This Year';
    case 'all': return 'All Time';
    default: return 'This Month';
  }
}

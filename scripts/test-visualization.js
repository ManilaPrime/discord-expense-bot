/**
 * Visualization testing script
 * Tests the chart generation without needing Discord
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

// Sample expense data for testing
const sampleExpenses = [
  { timestamp: '2025-04-01T12:00:00Z', username: 'TestUser', amount: 20, currency: 'USD', description: 'Lunch', category: 'Food' },
  { timestamp: '2025-04-02T14:30:00Z', username: 'TestUser', amount: 35, currency: 'USD', description: 'Gas', category: 'Transportation' },
  { timestamp: '2025-04-03T18:45:00Z', username: 'TestUser', amount: 15, currency: 'USD', description: 'Coffee', category: 'Food' },
  { timestamp: '2025-04-05T09:15:00Z', username: 'TestUser', amount: 50, currency: 'USD', description: 'Books', category: 'Education' },
  { timestamp: '2025-04-08T20:30:00Z', username: 'TestUser', amount: 120, currency: 'USD', description: 'Groceries', category: 'Food' },
  { timestamp: '2025-04-10T13:20:00Z', username: 'TestUser', amount: 45, currency: 'USD', description: 'Uber', category: 'Transportation' },
  { timestamp: '2025-04-15T17:00:00Z', username: 'TestUser', amount: 60, currency: 'USD', description: 'Dinner', category: 'Food' },
  { timestamp: '2025-04-20T11:45:00Z', username: 'TestUser', amount: 25, currency: 'USD', description: 'Movie', category: 'Entertainment' },
  { timestamp: '2025-04-22T16:30:00Z', username: 'TestUser', amount: 80, currency: 'USD', description: 'Clothes', category: 'Shopping' },
  { timestamp: '2025-04-25T08:00:00Z', username: 'TestUser', amount: 40, currency: 'USD', description: 'Breakfast', category: 'Food' }
];

// Configure chart canvas
const width = 800;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

// Generate directory for test images
const testDir = path.join(__dirname, '../test-output');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Test function to generate a pie chart
async function testPieChart() {
  console.log('Generating category pie chart...');
  
  // Group expenses by category
  const categoryData = {};
  
  sampleExpenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += expense.amount;
  });

  // Prepare chart data
  const labels = Object.keys(categoryData);
  const data = Object.values(categoryData);
  
  // Generate random colors
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
          text: 'Expenses by Category',
          font: {
            size: 18
          }
        },
        legend: {
          position: 'right'
        }
      }
    }
  };

  // Generate chart
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  const outputPath = path.join(testDir, 'pie-chart.png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Pie chart saved to: ${outputPath}`);
}

// Test function to generate a bar chart
async function testBarChart() {
  console.log('Generating category bar chart...');
  
  // Group expenses by category
  const categoryData = {};
  
  sampleExpenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    if (!categoryData[category]) {
      categoryData[category] = 0;
    }
    categoryData[category] += expense.amount;
  });

  // Sort categories by amount
  const sortedCategories = Object.entries(categoryData)
    .sort((a, b) => b[1] - a[1]);
  
  const labels = sortedCategories.map(entry => entry[0]);
  const data = sortedCategories.map(entry => entry[1]);
  
  const configuration = {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Amount Spent',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        title: {
          display: true,
          text: 'Expenses by Category',
          font: {
            size: 18
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount'
          }
        }
      }
    }
  };

  // Generate chart
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  const outputPath = path.join(testDir, 'bar-chart.png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`Bar chart saved to: ${outputPath}`);
}

// Run the tests
async function runTests() {
  console.log('Starting visualization tests...');
  console.log(`Test images will be saved to: ${testDir}`);
  
  try {
    await testPieChart();
    await testBarChart();
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

runTests();

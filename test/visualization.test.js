const { SlashCommandBuilder } = require('discord.js');
const visualizeCommand = require('../commands/visualize');

// Mock dependencies
jest.mock('../services/sheetService');
jest.mock('chartjs-node-canvas');
jest.mock('../utils/logger');

describe('Visualization Command Tests', () => {
  test('command should be properly configured', () => {
    // Verify the command structure
    expect(visualizeCommand.data).toBeInstanceOf(SlashCommandBuilder);
    expect(visualizeCommand.data.name).toBe('visualize');
    
    // Check that required options are present
    const options = visualizeCommand.data.options;
    
    // Find the type option
    const typeOption = options.find(opt => opt.name === 'type');
    expect(typeOption).toBeDefined();
    expect(typeOption.required).toBe(true);
    
    // Verify chart type choices
    const typeChoices = typeOption.choices;
    expect(typeChoices).toContainEqual(expect.objectContaining({ value: 'pie-category' }));
    expect(typeChoices).toContainEqual(expect.objectContaining({ value: 'bar-weekly' }));
    expect(typeChoices).toContainEqual(expect.objectContaining({ value: 'line-monthly' }));
    expect(typeChoices).toContainEqual(expect.objectContaining({ value: 'bar-category' }));
    
    // Check period option
    const periodOption = options.find(opt => opt.name === 'period');
    expect(periodOption).toBeDefined();
    expect(periodOption.required).toBe(false);
    
    // Verify period choices
    const periodChoices = periodOption.choices;
    expect(periodChoices).toContainEqual(expect.objectContaining({ value: 'week' }));
    expect(periodChoices).toContainEqual(expect.objectContaining({ value: 'month' }));
    expect(periodChoices).toContainEqual(expect.objectContaining({ value: 'year' }));
    expect(periodChoices).toContainEqual(expect.objectContaining({ value: 'all' }));
  });

  test('execute function should exist', () => {
    expect(typeof visualizeCommand.execute).toBe('function');
  });
});

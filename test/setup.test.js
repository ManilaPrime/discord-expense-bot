require('dotenv').config();
const { createNewSheet, validateSheetAccess } = require('../services/sheetService');
const fs = require('fs');
const path = require('path');

// Mock the Google API dependencies
jest.mock('google-auth-library');
jest.mock('googleapis');
jest.mock('google-spreadsheet');
jest.mock('fs');
jest.mock('../utils/logger');

describe('Sheet Service Setup Tests', () => {
  // Mock environment and credentials before tests
  beforeEach(() => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = './credentials.json';
    
    // Mock the credentials file
    fs.readFileSync.mockReturnValue(JSON.stringify({
      client_email: 'test@example.com',
      private_key: 'test_key'
    }));
  });

  test('createNewSheet should create a Google Sheet', async () => {
    // Mock the Google Sheets API response with proper sheets array
    const mockSpreadsheet = {
      data: {
        spreadsheetId: 'test-sheet-id',
        spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/test-sheet-id',
        sheets: [
          {
            properties: {
              sheetId: 123456,
              title: 'Expenses'
            }
          },
          {
            properties: {
              sheetId: 789012,
              title: 'Summary'
            }
          }
        ]
      }
    };
    
    // Mock Google Drive API for permissions
    const mockPermissionResponse = {
      data: { id: 'test-permission-id' }
    };
    
    // Set up mocks for Google APIs
    const { google } = require('googleapis');
    const mockSheetsApi = {
      spreadsheets: {
        create: jest.fn().mockResolvedValue(mockSpreadsheet),
        values: {
          update: jest.fn().mockResolvedValue({})
        },
        batchUpdate: jest.fn().mockResolvedValue({})
      }
    };
    
    const mockDriveApi = {
      permissions: {
        create: jest.fn().mockResolvedValue(mockPermissionResponse)
      }
    };
    
    google.sheets.mockReturnValue(mockSheetsApi);
    google.drive.mockReturnValue(mockDriveApi);

    // Call the function with test data
    const result = await createNewSheet('Test Expense Sheet', true);
    
    // Check the result matches expected values
    expect(result).toEqual({
      spreadsheetId: 'test-sheet-id',
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/test-sheet-id',
      isPublic: true
    });
    
    // Verify Google API was called with expected arguments
    expect(google.sheets).toHaveBeenCalled();
    expect(mockSheetsApi.spreadsheets.create).toHaveBeenCalled();
    expect(mockSheetsApi.spreadsheets.values.update).toHaveBeenCalled();
    expect(mockSheetsApi.spreadsheets.batchUpdate).toHaveBeenCalled();
    expect(mockDriveApi.permissions.create).toHaveBeenCalled();
  });

  test('validateSheetAccess should verify sheet exists and is accessible', async () => {
    // Mock GoogleSpreadsheet implementation
    const { GoogleSpreadsheet } = require('google-spreadsheet');
    GoogleSpreadsheet.mockImplementation(() => ({
      loadInfo: jest.fn().mockResolvedValue({}),
      title: 'Test Sheet'
    }));

    // Call the function with test data
    const result = await validateSheetAccess('existing-sheet-id');
    
    // Check the result
    expect(result.success).toBe(true);
    expect(result.title).toBe('Test Sheet');
    expect(result.url).toBe('https://docs.google.com/spreadsheets/d/existing-sheet-id');
  });

  test('validateSheetAccess should handle errors gracefully', async () => {
    // Mock GoogleSpreadsheet implementation with error
    const { GoogleSpreadsheet } = require('google-spreadsheet');
    GoogleSpreadsheet.mockImplementation(() => ({
      loadInfo: jest.fn().mockRejectedValue(new Error('Access denied'))
    }));

    // Call the function with test data
    const result = await validateSheetAccess('invalid-sheet-id');
    
    // Check the result handles the error correctly
    expect(result.success).toBe(false);
    expect(result.error).toContain('Could not access the Google Sheet');
  });
});

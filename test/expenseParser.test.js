const { parseExpense } = require('../utils/expenseParser');

describe('Expense Parser Tests', () => {
  beforeEach(() => {
    // Set default currency for testing
    process.env.DEFAULT_CURRENCY = 'USD';
  });

  test('should parse a simple expense', () => {
    const result = parseExpense('20 lunch');
    
    expect(result).toEqual({
      amount: 20,
      currency: 'USD',
      description: 'lunch',
      category: null
    });
  });

  test('should parse an expense with decimal amount', () => {
    const result = parseExpense('15.75 coffee');
    
    expect(result).toEqual({
      amount: 15.75,
      currency: 'USD',
      description: 'coffee',
      category: null
    });
  });

  test('should parse an expense with explicit currency', () => {
    const result = parseExpense('30 EUR dinner');
    
    expect(result).toEqual({
      amount: 30,
      currency: 'EUR',
      description: 'dinner',
      category: null
    });
  });

  test('should parse an expense with category', () => {
    const result = parseExpense('50 groceries #food');
    
    expect(result).toEqual({
      amount: 50,
      currency: 'USD',
      description: 'groceries',
      category: 'food'
    });
  });

  test('should parse an expense with currency and category', () => {
    const result = parseExpense('25.50 GBP taxi ride #transportation');
    
    expect(result).toEqual({
      amount: 25.50,
      currency: 'GBP',
      description: 'taxi ride',
      category: 'transportation'
    });
  });

  test('should return null for invalid format', () => {
    expect(parseExpense('this is not an expense')).toBeNull();
    expect(parseExpense('lunch 20')).toBeNull();
    expect(parseExpense('-20 lunch')).toBeNull();
    expect(parseExpense('0 lunch')).toBeNull();
  });
});

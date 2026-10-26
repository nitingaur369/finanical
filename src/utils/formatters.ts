import { ExpenseCategory } from '../types';

/**
 * Format a number into Indian Rupee currency format (e.g. ₹12,450 or ₹1,50,000)
 */
export function formatINR(amount: number, showDecimals = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}

/**
 * Format date string (YYYY-MM-DD) into readable Indian date
 */
export function formatDate(dateString: string, formatType: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  if (isNaN(date.getTime())) return dateString;

  if (formatType === 'short') {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  if (formatType === 'long') {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format YYYY-MM into readable month name (e.g. October 2026)
 */
export function formatMonthYear(yearMonth: string): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

/**
 * Color and styling tokens for each Expense Category
 */
export const CATEGORY_METADATA: Record<
  ExpenseCategory,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    chartColor: string;
    iconName: string;
  }
> = {
  'Food and dining': {
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    textColor: '#FBBF24',
    chartColor: '#F59E0B',
    iconName: 'Utensils',
  },
  'Groceries': {
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    textColor: '#34D399',
    chartColor: '#10B981',
    iconName: 'ShoppingBag',
  },
  'Transport': {
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    textColor: '#7DD3FC',
    chartColor: '#38BDF8',
    iconName: 'Car',
  },
  'Bills and utilities': {
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.12)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    textColor: '#818CF8',
    chartColor: '#6366F1',
    iconName: 'Zap',
  },
  'Shopping': {
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.12)',
    borderColor: 'rgba(236, 72, 153, 0.3)',
    textColor: '#F472B6',
    chartColor: '#EC4899',
    iconName: 'Package',
  },
  'Entertainment': {
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    textColor: '#A78BFA',
    chartColor: '#8B5CF6',
    iconName: 'Film',
  },
  'Clothing': {
    color: '#14B8A6',
    bgColor: 'rgba(20, 184, 166, 0.12)',
    borderColor: 'rgba(20, 184, 166, 0.3)',
    textColor: '#2DD4BF',
    chartColor: '#14B8A6',
    iconName: 'Shirt',
  },
  'Cosmetics and personal care': {
    color: '#F43F5E',
    bgColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    textColor: '#FB7185',
    chartColor: '#F43F5E',
    iconName: 'Sparkles',
  },
  'Education': {
    color: '#06B6D4',
    bgColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
    textColor: '#22D3EE',
    chartColor: '#06B6D4',
    iconName: 'BookOpen',
  },
  'Healthcare': {
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    textColor: '#F87171',
    chartColor: '#EF4444',
    iconName: 'HeartPulse',
  },
  'Other': {
    color: '#94A3B8',
    bgColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
    textColor: '#CBD5E1',
    chartColor: '#94A3B8',
    iconName: 'MoreHorizontal',
  },
};

export const ALL_CATEGORIES: ExpenseCategory[] = [
  'Groceries',
  'Food and dining',
  'Clothing',
  'Cosmetics and personal care',
  'Transport',
  'Education',
  'Entertainment',
  'Shopping',
  'Bills and utilities',
  'Healthcare',
  'Other',
];

export const ALL_PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking'] as const;

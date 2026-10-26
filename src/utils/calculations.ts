import {
  Transaction,
  BudgetConfig,
  MonthlySummary,
  CategoryBreakdown,
  ExpenseCategory,
  SavingsSimulation,
} from '../types';
import { ALL_CATEGORIES } from './formatters';

/**
 * Filter transactions for a specific month (YYYY-MM)
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  yearMonth: string
): Transaction[] {
  if (!yearMonth) return transactions;
  return transactions.filter((t) => t.date.startsWith(yearMonth));
}

/**
 * Get the previous month string in YYYY-MM format
 */
export function getPreviousMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  date.setMonth(date.getMonth() - 1);
  const prevYear = date.getFullYear();
  const prevMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${prevYear}-${prevMonth}`;
}

/**
 * Group and summarize expenses category-wise
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categoryBudgets: Partial<Record<ExpenseCategory, number>> = {}
): CategoryBreakdown[] {
  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<ExpenseCategory, { amount: number; count: number }>();

  ALL_CATEGORIES.forEach((cat) => {
    categoryMap.set(cat, { amount: 0, count: 0 });
  });

  transactions.forEach((t) => {
    const current = categoryMap.get(t.category) || { amount: 0, count: 0 };
    categoryMap.set(t.category, {
      amount: current.amount + t.amount,
      count: current.count + 1,
    });
  });

  const breakdown: CategoryBreakdown[] = [];

  categoryMap.forEach((data, category) => {
    if (data.amount > 0 || (categoryBudgets[category] && categoryBudgets[category]! > 0)) {
      const percentage = totalSpend > 0 ? (data.amount / totalSpend) * 100 : 0;
      const budget = categoryBudgets[category];
      const budgetUtilization = budget && budget > 0 ? (data.amount / budget) * 100 : undefined;

      breakdown.push({
        category,
        amount: data.amount,
        percentage: Math.round(percentage * 10) / 10,
        count: data.count,
        budget,
        budgetUtilization: budgetUtilization !== undefined ? Math.round(budgetUtilization) : undefined,
      });
    }
  });

  // Sort descending by amount
  return breakdown.sort((a, b) => b.amount - a.amount);
}

/**
 * Calculate complete monthly summary with previous month comparison
 */
export function calculateMonthlySummary(
  transactions: Transaction[],
  budgetConfig: BudgetConfig,
  yearMonth: string
): MonthlySummary {
  const currentMonthTransactions = filterTransactionsByMonth(transactions, yearMonth);
  const totalSpend = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0);

  const prevMonthStr = getPreviousMonth(yearMonth);
  const prevMonthTransactions = filterTransactionsByMonth(transactions, prevMonthStr);
  const hasPrevMonthData = prevMonthTransactions.length > 0;
  const prevMonthTotal = hasPrevMonthData
    ? prevMonthTransactions.reduce((sum, t) => sum + t.amount, 0)
    : null;

  let percentChange: number | null = null;
  if (prevMonthTotal !== null && prevMonthTotal > 0) {
    percentChange = Math.round(((totalSpend - prevMonthTotal) / prevMonthTotal) * 100);
  }

  const overallBudget = budgetConfig.monthlyOverallBudget || 0;
  const remainingBudget = overallBudget - totalSpend;
  const percentageUsed = overallBudget > 0 ? Math.round((totalSpend / overallBudget) * 100) : 0;

  const categoryBreakdown = calculateCategoryBreakdown(
    currentMonthTransactions,
    budgetConfig.categoryBudgets
  );

  const topCategoryItem = categoryBreakdown.find((c) => c.amount > 0);
  const topCategory = topCategoryItem
    ? {
        category: topCategoryItem.category,
        amount: topCategoryItem.amount,
        percentage: topCategoryItem.percentage,
      }
    : null;

  const transactionCount = currentMonthTransactions.length;
  const averageTransaction =
    transactionCount > 0 ? Math.round(totalSpend / transactionCount) : 0;

  let largestTransaction: Transaction | null = null;
  if (currentMonthTransactions.length > 0) {
    largestTransaction = [...currentMonthTransactions].sort((a, b) => b.amount - a.amount)[0];
  }

  return {
    yearMonth,
    totalSpend,
    overallBudget,
    remainingBudget,
    percentageUsed,
    prevMonthTotal,
    percentChange,
    categoryBreakdown,
    topCategory,
    averageTransaction,
    largestTransaction,
    transactionCount,
  };
}

/**
 * Check budget status: safe, warning (>=80%), or exceeded (>100%)
 */
export function getBudgetAlertStatus(
  spent: number,
  budget: number
): { status: 'safe' | 'warning' | 'danger'; percentage: number; remaining: number } {
  if (!budget || budget <= 0) {
    return { status: 'safe', percentage: 0, remaining: 0 };
  }

  const percentage = Math.round((spent / budget) * 100);
  const remaining = budget - spent;

  if (percentage >= 100) {
    return { status: 'danger', percentage, remaining };
  } else if (percentage >= 80) {
    return { status: 'warning', percentage, remaining };
  }

  return { status: 'safe', percentage, remaining };
}

/**
 * Calculate dynamic savings simulation
 */
export function calculateSavingsSimulation(
  transactions: Transaction[],
  category: ExpenseCategory,
  weeklyReduction: number,
  yearMonth: string
): SavingsSimulation {
  const currentMonthTransactions = filterTransactionsByMonth(transactions, yearMonth);
  const categoryTransactions = currentMonthTransactions.filter((t) => t.category === category);
  const currentMonthlySpend = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

  const fourWeeksSaving = Math.round(weeklyReduction * 4);
  const threeMonthsSaving = Math.round(weeklyReduction * 13);
  const twelveMonthsSaving = Math.round(weeklyReduction * 52);

  const monthlyReduction = weeklyReduction * 4.33; // Average weeks per month
  const reductionPercentage =
    currentMonthlySpend > 0 ? Math.min(100, Math.round((monthlyReduction / currentMonthlySpend) * 100)) : 0;

  return {
    category,
    currentMonthlySpend,
    weeklyReduction,
    fourWeeksSaving,
    threeMonthsSaving,
    twelveMonthsSaving,
    reductionPercentage,
  };
}

/**
 * Extract unique sorted YYYY-MM list from transactions
 */
export function getAvailableMonths(transactions: Transaction[], defaultMonth: string): string[] {
  const monthsSet = new Set<string>();
  monthsSet.add(defaultMonth);

  transactions.forEach((t) => {
    if (t.date && t.date.length >= 7) {
      monthsSet.add(t.date.slice(0, 7));
    }
  });

  return Array.from(monthsSet).sort().reverse();
}

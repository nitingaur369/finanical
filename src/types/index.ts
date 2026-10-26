export type ExpenseCategory =
  | 'Groceries'
  | 'Food and dining'
  | 'Clothing'
  | 'Cosmetics and personal care'
  | 'Transport'
  | 'Education'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills and utilities'
  | 'Healthcare'
  | 'Other';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Cash' | 'Net Banking';

export interface Transaction {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod: PaymentMethod;
  isSample?: boolean;
  createdAt: string;
}

export interface BudgetConfig {
  monthlyOverallBudget: number;
  categoryBudgets: Partial<Record<ExpenseCategory, number>>;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
  budget?: number;
  budgetUtilization?: number;
}

export interface MonthlySummary {
  yearMonth: string; // YYYY-MM
  totalSpend: number;
  overallBudget: number;
  remainingBudget: number;
  percentageUsed: number;
  prevMonthTotal: number | null;
  percentChange: number | null;
  categoryBreakdown: CategoryBreakdown[];
  topCategory: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  } | null;
  averageTransaction: number;
  largestTransaction: Transaction | null;
  transactionCount: number;
}

export interface SavingsSimulation {
  category: ExpenseCategory;
  currentMonthlySpend: number;
  weeklyReduction: number;
  fourWeeksSaving: number;
  threeMonthsSaving: number;
  twelveMonthsSaving: number;
  reductionPercentage: number;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mode?: 'deterministic' | 'gemini';
  facts?: string[];
  suggestions?: string[];
  metadata?: {
    totalSpend?: number;
    topCategory?: string;
    budgetUsed?: number;
  };
}

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'analytics'
  | 'assistant'
  | 'challenges'
  | 'simulator'
  | 'split';

export interface AffordabilityEvaluation {
  productName: string;
  price: number;
  category: ExpenseCategory;
  isNeed: boolean;
  status: 'safe' | 'caution' | 'danger';
  score: number; // 0 to 100
  verdictTitle: string;
  verdictMessage: string;
  remainingAfterPurchase: number;
  budgetImpactPct: number;
  sipOpportunity5Yr: number;
  coolingOffSuggestion: string;
  ruleEvaluation: {
    withinBudget: boolean;
    bufferComfortable: boolean;
    categoryCapAvailable: boolean;
  };
}

export interface SavingChallenge {
  id: string;
  title: string;
  category: string;
  weeklySavingEstimate: number;
  twist: string;
  description: string;
  impactBenchmark: string;
  isCompleted: boolean;
  badge: string;
}

export interface InvestmentOption {
  id: string;
  name: string;
  category: 'Index Funds' | 'Flexi Cap' | 'Emergency & Liquid' | 'Gold & SGB' | 'Tax Saving ELSS' | 'Safe FD/RD';
  risk: 'Low' | 'Moderate' | 'High';
  expectedReturnCAGR: string;
  minMonthlySIP: number;
  lockInPeriod: string;
  description: string;
  bestFor: string;
  topFunds: string[];
}

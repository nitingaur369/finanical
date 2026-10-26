import { InvestmentOption, MonthlySummary } from '../types';
import { formatINR } from '../utils/formatters';

export const INDIAN_INVESTMENT_OPTIONS: InvestmentOption[] = [
  {
    id: 'nifty-50-index',
    name: 'Nifty 50 Index Mutual Funds',
    category: 'Index Funds',
    risk: 'Moderate',
    expectedReturnCAGR: '12% – 14%',
    minMonthlySIP: 100,
    lockInPeriod: 'None (Liquid anytime)',
    description:
      'Passively tracks India’s top 50 bluechip companies (Reliance, TCS, HDFC Bank, Infosys). Lowest expense ratio, no fund manager bias, ideal foundation for college students and young professionals.',
    bestFor: 'Long-term wealth creation (3+ years horizon)',
    topFunds: ['UTI Nifty 50 Index Fund', 'HDFC Index Nifty 50', 'Navi Nifty 50 Index'],
  },
  {
    id: 'flexi-cap-fund',
    name: 'Flexi Cap Equity Mutual Funds',
    category: 'Flexi Cap',
    risk: 'High',
    expectedReturnCAGR: '13% – 16%',
    minMonthlySIP: 500,
    lockInPeriod: 'None (Liquid anytime)',
    description:
      'Dynamically invests across Large Cap, Mid Cap, and Small Cap Indian companies, with international equity diversification. Managed by expert research teams.',
    bestFor: 'Aggressive wealth building with 5+ years horizon',
    topFunds: ['Parag Parikh Flexi Cap Fund', 'Quant Flexi Cap Fund', 'JM Flexicap'],
  },
  {
    id: 'liquid-emergency-fund',
    name: 'Liquid & Ultra-Short Debt Funds',
    category: 'Emergency & Liquid',
    risk: 'Low',
    expectedReturnCAGR: '6.8% – 7.4%',
    minMonthlySIP: 500,
    lockInPeriod: 'None (Instant redemption available)',
    description:
      'Invests in ultra-safe short-term government treasury bills and commercial paper. Yields nearly double typical bank savings accounts while maintaining immediate liquidity for medical or emergency needs.',
    bestFor: 'Building a 3-6 month emergency buffer',
    topFunds: ['Aditya Birla Sun Life Liquid Fund', 'ICICI Prudential Liquid Fund', 'Nippon India Liquid'],
  },
  {
    id: 'gold-sgb',
    name: 'Sovereign Gold Bonds (SGB) & Gold ETFs',
    category: 'Gold & SGB',
    risk: 'Moderate',
    expectedReturnCAGR: '10% – 12% + 2.5% RBI interest',
    minMonthlySIP: 500,
    lockInPeriod: '5-8 Years (Tradeable on NSE/BSE)',
    description:
      'Issued by the Reserve Bank of India (RBI) on behalf of the Government of India. Eliminates gold making charges, pays a guaranteed 2.5% annual interest payout, and capital gains are 100% tax-free on maturity.',
    bestFor: 'Inflation hedge and capital preservation',
    topFunds: ['RBI Sovereign Gold Bond Tranches', 'Nippon India Gold ETF', 'HDFC Gold ETF'],
  },
  {
    id: 'elss-tax-saving',
    name: 'ELSS Tax Saver Equity Funds',
    category: 'Tax Saving ELSS',
    risk: 'High',
    expectedReturnCAGR: '13% – 15%',
    minMonthlySIP: 500,
    lockInPeriod: '3 Years (Shortest among all 80C options)',
    description:
      'Allows tax deduction up to ₹1.5 Lakhs per financial year under Section 80C (Old Tax Regime). Has the shortest lock-in period compared to PPF (15 years) or Tax-Saving FDs (5 years).',
    bestFor: 'Salaried professionals seeking tax saving with equity growth',
    topFunds: ['Mirae Asset ELSS Tax Saver', 'Quant ELSS Tax Saver', 'Bandhan ELSS Tax Saver'],
  },
  {
    id: 'safe-recurring-deposit',
    name: 'High-Yield Bank RD / Fixed Deposit',
    category: 'Safe FD/RD',
    risk: 'Low',
    expectedReturnCAGR: '7.1% – 8.0%',
    minMonthlySIP: 500,
    lockInPeriod: 'Flexible (6 months to 5 years)',
    description:
      'Zero market risk. Guaranteed returns insured up to ₹5 Lakhs by RBI DICGC. Perfect for short-term goals within 6-12 months (e.g. college semester fees or gadget purchases).',
    bestFor: 'Risk-averse individuals with zero tolerance for volatility',
    topFunds: ['Scheduled Commercial Banks (SBI, HDFC, ICICI)', 'Small Finance Banks (AU, Equitas)'],
  },
];

/**
 * Calculate SIP Future Value using compound formula
 * FV = P * [ (1 + r)^n - 1 ] / r * (1 + r)
 */
export function calculateSIPFutureValue(monthlyInvestment: number, annualRatePct: number, years: number): {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
} {
  const i = annualRatePct / 100 / 12; // Monthly interest rate
  const n = years * 12; // Number of months

  const totalValue = Math.round(monthlyInvestment * ((Math.pow(1 + i, n) - 1) / i) * (1 + i));
  const investedAmount = monthlyInvestment * n;
  const estimatedReturns = Math.max(0, totalValue - investedAmount);

  return {
    investedAmount,
    estimatedReturns,
    totalValue,
  };
}

export interface InvestmentAdviceResponse {
  surplusINR: number;
  recommendedSIPINR: number;
  riskProfile: 'Conservative' | 'Balanced' | 'Growth';
  primaryRecommendation: InvestmentOption;
  secondaryRecommendation: InvestmentOption;
  threeYearProjection: number;
  fiveYearProjection: number;
  tenYearProjection: number;
  actionableSteps: string[];
}

/**
 * Generate personalized investment recommendations based on verified surplus
 */
export function generatePersonalizedInvestmentAdvice(
  monthlySummary: MonthlySummary,
  riskPreference: 'Conservative' | 'Balanced' | 'Growth' = 'Balanced'
): InvestmentAdviceResponse {
  const surplus = Math.max(0, monthlySummary.remainingBudget);

  // Recommend 20% to 30% of remaining buffer, rounded to clean Indian notes (e.g. ₹500, ₹1,000, ₹2,000)
  let recommendedSIP = 500;
  if (surplus >= 10000) {
    recommendedSIP = Math.min(3000, Math.floor((surplus * 0.25) / 500) * 500);
  } else if (surplus >= 4000) {
    recommendedSIP = Math.min(1500, Math.floor((surplus * 0.2) / 500) * 500);
  } else if (surplus >= 1500) {
    recommendedSIP = 500;
  } else {
    recommendedSIP = 250;
  }

  // Pick options matching risk profile
  let primary: InvestmentOption = INDIAN_INVESTMENT_OPTIONS[0]; // Nifty 50 Index default
  let secondary: InvestmentOption = INDIAN_INVESTMENT_OPTIONS[2]; // Liquid / Emergency default
  let rate = 12;

  if (riskPreference === 'Conservative') {
    primary = INDIAN_INVESTMENT_OPTIONS[2]; // Liquid Fund
    secondary = INDIAN_INVESTMENT_OPTIONS[5]; // Safe FD/RD
    rate = 7.5;
  } else if (riskPreference === 'Growth') {
    primary = INDIAN_INVESTMENT_OPTIONS[1]; // Flexi Cap Fund
    secondary = INDIAN_INVESTMENT_OPTIONS[0]; // Nifty 50 Index
    rate = 14;
  }

  const proj3 = calculateSIPFutureValue(recommendedSIP, rate, 3).totalValue;
  const proj5 = calculateSIPFutureValue(recommendedSIP, rate, 5).totalValue;
  const proj10 = calculateSIPFutureValue(recommendedSIP, rate, 10).totalValue;

  return {
    surplusINR: surplus,
    recommendedSIPINR: recommendedSIP,
    riskProfile: riskPreference,
    primaryRecommendation: primary,
    secondaryRecommendation: secondary,
    threeYearProjection: proj3,
    fiveYearProjection: proj5,
    tenYearProjection: proj10,
    actionableSteps: [
      `Complete your online Aadhaar + PAN KYC on any direct mutual fund app (e.g. Groww, Zerodha Coin, or MFCentral) with zero broker commission.`,
      `Set up an automated monthly auto-debit (e.g. 5th of every month) for ${formatINR(recommendedSIP)} so your investments occur automatically before casual spending begins.`,
      `Always choose 'Direct - Growth' plans over 'Regular' plans to save 1% to 1.5% in distributor commissions every single year.`,
    ],
  };
}

export const FREQUENT_INVESTING_DOUBTS = [
  {
    q: 'What is a SIP and how does it work for a student or beginner?',
    a: 'A Systematic Investment Plan (SIP) allows you to invest a fixed sum (as low as ₹100 or ₹500) every month on a specific date into a mutual fund. Instead of timing the stock market, you buy more units when prices fall and fewer when they rise (called Rupee Cost Averaging). Over 3 to 10 years, compounding accelerates your wealth dramatically.',
  },
  {
    q: 'Where should I invest if I only have ₹500 to ₹1,000 per month?',
    a: 'For ₹500 to ₹1,000/month, the gold standard recommendation is a Low-Cost Nifty 50 Index Fund (such as UTI Nifty 50 or Navi Nifty 50). It gives you instant ownership in the 50 largest corporations in India with near-zero management fees.',
  },
  {
    q: 'Why should I pick Mutual Funds over a Bank Fixed Deposit (FD)?',
    a: 'Bank FDs currently yield 6.5% - 7.5% per year before income tax. With Indian consumer inflation at 5% - 6%, your real post-tax return in an FD is barely 1% - 2%. Broad-market equity index funds have historically generated 12% - 14% CAGR over 7+ year horizons, beating inflation significantly.',
  },
  {
    q: 'Is my money locked in an SIP? Can I withdraw anytime?',
    a: 'Yes, in standard open-ended Mutual Funds (like Index Funds or Flexi Cap Funds), you can pause, stop, or withdraw your money anytime within 24 to 48 hours directly into your bank account with zero penalty after 1 year. Only tax-saving ELSS funds have a mandatory 3-year lock-in.',
  },
  {
    q: 'How much emergency fund should an Indian household maintain?',
    a: 'You should ideally maintain 3 to 6 months of mandatory living expenses (rent, utilities, groceries, medicines) in an ultra-liquid account (like a Liquid Mutual Fund or high-yield savings account) before committing large sums to long-term equity.',
  },
];

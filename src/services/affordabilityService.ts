import { AffordabilityEvaluation, ExpenseCategory, MonthlySummary, BudgetConfig } from '../types';
import { formatINR } from '../utils/formatters';

export function evaluateAffordability(
  productName: string,
  price: number,
  category: ExpenseCategory,
  isNeed: boolean,
  monthlySummary: MonthlySummary,
  budgets: BudgetConfig
): AffordabilityEvaluation {
  const cleanPrice = Math.max(0, price || 0);
  const remainingBudget = monthlySummary.remainingBudget;
  const afterPurchaseRemaining = remainingBudget - cleanPrice;

  // Category cap check
  const categoryCap = budgets.categoryBudgets[category];
  const catBreakdown = monthlySummary.categoryBreakdown.find((c) => c.category === category);
  const catSpend = catBreakdown ? catBreakdown.amount : 0;
  const catRemaining = categoryCap ? categoryCap - catSpend : undefined;
  const causesCategoryBreach = catRemaining !== undefined && catRemaining - cleanPrice < 0;

  const budgetImpactPct =
    remainingBudget > 0 ? Math.min(100, Math.round((cleanPrice / remainingBudget) * 100)) : 100;

  // SIP 5-year opportunity cost (one-time lump-sum equivalent compounding at 12% for 5 years)
  // FV = P * (1 + 0.12)^5 = P * 1.7623
  const sipOpportunity5Yr = Math.round(cleanPrice * 1.7623);

  let status: 'safe' | 'caution' | 'danger' = 'safe';
  let score = 90;
  let verdictTitle = 'Go For It! Comfortably Affordable';
  let verdictMessage = '';

  const withinBudget = afterPurchaseRemaining >= 0;
  const bufferComfortable = afterPurchaseRemaining >= monthlySummary.overallBudget * 0.15;
  const categoryCapAvailable = !causesCategoryBreach;

  if (cleanPrice <= 0) {
    return {
      productName: productName || 'Item',
      price: 0,
      category,
      isNeed,
      status: 'safe',
      score: 100,
      verdictTitle: 'Enter a valid price',
      verdictMessage: 'Please enter the item price to see live affordability recommendations.',
      remainingAfterPurchase: remainingBudget,
      budgetImpactPct: 0,
      sipOpportunity5Yr: 0,
      coolingOffSuggestion: 'No cost entered.',
      ruleEvaluation: { withinBudget: true, bufferComfortable: true, categoryCapAvailable: true },
    };
  }

  // 1. Danger: Breaches budget
  if (!withinBudget) {
    status = 'danger';
    score = Math.max(10, Math.round(40 - Math.abs(afterPurchaseRemaining) / 100));
    verdictTitle = '🛑 Not Recommended — Will Cause Budget Deficit';
    verdictMessage = `Purchasing "${productName || 'this product'}" for ${formatINR(
      cleanPrice
    )} will put you ${formatINR(Math.abs(afterPurchaseRemaining))} in the red for this month.`;
  }
  // 2. Caution: Large portion of buffer or category cap breached
  else if (causesCategoryBreach) {
    status = 'caution';
    score = 55;
    verdictTitle = '⚠️ Caution — Exceeds Category Spending Cap';
    verdictMessage = `You have enough overall balance, but this purchase exceeds your allocated ${category} monthly limit by ${formatINR(
      Math.abs(catRemaining! - cleanPrice)
    )}. Consider rebalancing from another envelope.`;
  } else if (!isNeed && budgetImpactPct > 45) {
    status = 'caution';
    score = 60;
    verdictTitle = '⏳ Pause & Apply 7-Day Cooling Rule';
    verdictMessage = `This purchase consumes ${budgetImpactPct}% of your entire remaining monthly buffer. Since it's a discretionary want, pause for 7 days before buying. If you still want it next week, purchase with confidence.`;
  }
  // 3. Safe
  else {
    status = 'safe';
    score = Math.min(98, Math.round(85 + (100 - budgetImpactPct) / 10));
    verdictTitle = '🟢 Go For It! Comfortably Affordable';
    verdictMessage = `You can easily afford this! You will still have ${formatINR(
      afterPurchaseRemaining
    )} remaining in your buffer for the rest of the month.`;
  }

  const coolingOffSuggestion = !isNeed
    ? `Since this is a 'Want', try adding it to a wishlist for 7 days. If the urge passes, you just saved ${formatINR(
        cleanPrice
      )}!`
    : `This is classified as a 'Need'. If it is essential for health, education, or work, proceed without hesitation.`;

  return {
    productName: productName.trim() || 'Specified Item',
    price: cleanPrice,
    category,
    isNeed,
    status,
    score,
    verdictTitle,
    verdictMessage,
    remainingAfterPurchase: afterPurchaseRemaining,
    budgetImpactPct,
    sipOpportunity5Yr,
    coolingOffSuggestion,
    ruleEvaluation: {
      withinBudget,
      bufferComfortable,
      categoryCapAvailable,
    },
  };
}

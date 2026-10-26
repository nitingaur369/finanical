import {
  MonthlySummary,
  Transaction,
  BudgetConfig,
  AIMessage,
} from '../types';
import { formatINR, formatMonthYear } from '../utils/formatters';

export interface AIResponsePayload {
  text: string;
  facts: string[];
  suggestions: string[];
  mode: 'deterministic' | 'gemini';
}

/**
 * Deterministic Financial Intelligence Engine
 * Computes exact, verified insights without hallucinating numbers.
 */
export function generateDeterministicResponse(
  query: string,
  summary: MonthlySummary,
  transactions: Transaction[],
  budgetConfig: BudgetConfig
): AIResponsePayload {
  const normalizedQuery = query.toLowerCase().trim();
  const currentMonthName = formatMonthYear(summary.yearMonth);

  const totalFormatted = formatINR(summary.totalSpend);
  const budgetFormatted = formatINR(summary.overallBudget);
  const remainingFormatted = formatINR(Math.abs(summary.remainingBudget));
  const isOverBudget = summary.remainingBudget < 0;

  const topCategoryName = summary.topCategory ? summary.topCategory.category : 'N/A';
  const topCategoryAmount = summary.topCategory ? formatINR(summary.topCategory.amount) : '₹0';
  const topCategoryPct = summary.topCategory ? `${summary.topCategory.percentage}%` : '0%';

  const top3 = summary.categoryBreakdown.filter((c) => c.amount > 0).slice(0, 3);

  // 1. "Where did most of my money go?" / Category queries
  if (
    normalizedQuery.includes('where did') ||
    normalizedQuery.includes('where my money') ||
    normalizedQuery.includes('most of my money') ||
    normalizedQuery.includes('top spending') ||
    normalizedQuery.includes('highest spending')
  ) {
    if (!summary.topCategory || summary.totalSpend === 0) {
      return {
        text: `No expenses have been recorded for ${currentMonthName} yet. Add an expense to see your category breakdown.`,
        facts: [`Total spend: ₹0`, `Transactions: 0`],
        suggestions: ['Start by adding your recent UPI, cash, or card expenses.'],
        mode: 'deterministic',
      };
    }

    const runnerUpText =
      top3.length > 1
        ? ` Followed by ${top3[1].category} at ${formatINR(top3[1].amount)} (${top3[1].percentage}%)` +
          (top3.length > 2
            ? ` and ${top3[2].category} at ${formatINR(top3[2].amount)} (${top3[2].percentage}%).`
            : '.')
        : '';

    const text = `In ${currentMonthName}, your highest spending category is ${topCategoryName}, accounting for ${topCategoryAmount} (${topCategoryPct} of your total ${totalFormatted} expenditure).${runnerUpText}`;

    return {
      text,
      facts: [
        `Largest Category: ${topCategoryName} (${topCategoryAmount}, ${topCategoryPct})`,
        `Total Spending: ${totalFormatted} across ${summary.transactionCount} transactions`,
        `Average Transaction: ${formatINR(summary.averageTransaction)}`,
      ],
      suggestions: [
        `Review the top items in ${topCategoryName} to spot any avoidable discretionary purchases.`,
        `Consider setting a specific category limit for ${topCategoryName} in the Budgets section.`,
      ],
      mode: 'deterministic',
    };
  }

  // 2. "Why did my spending increase?" / Comparison queries
  if (
    normalizedQuery.includes('why did') ||
    normalizedQuery.includes('increase') ||
    normalizedQuery.includes('decrease') ||
    normalizedQuery.includes('compared to') ||
    normalizedQuery.includes('previous month') ||
    normalizedQuery.includes('last month')
  ) {
    if (summary.prevMonthTotal === null) {
      return {
        text: `I cannot determine month-over-month trend changes because there are no recorded transactions for the previous month in your dataset. Spending comparisons require at least two consecutive months of data.`,
        facts: [
          `Current Month (${currentMonthName}): ${totalFormatted}`,
          `Previous Month: No recorded transactions`,
        ],
        suggestions: [
          `Add your expenses regularly to unlock automated month-over-month comparisons.`,
          `You can use 'Reset to Sample Data' in the sidebar to test historical trends.`,
        ],
        mode: 'deterministic',
      };
    }

    const diff = summary.totalSpend - summary.prevMonthTotal;
    const diffFormatted = formatINR(Math.abs(diff));
    const percentChange = summary.percentChange || 0;

    let explanation = '';
    if (diff > 0) {
      explanation = `Your recorded spending in ${currentMonthName} increased by ${diffFormatted} (+${percentChange}%) compared to the previous month (${formatINR(summary.prevMonthTotal)}). This was primarily driven by higher outlays in ${topCategoryName} (${topCategoryAmount}).`;
    } else if (diff < 0) {
      explanation = `Your recorded spending in ${currentMonthName} decreased by ${diffFormatted} (${percentChange}%) compared to the previous month (${formatINR(summary.prevMonthTotal)}). Your financial pacing has improved!`;
    } else {
      explanation = `Your recorded spending in ${currentMonthName} is identical to the previous month at ${totalFormatted}.`;
    }

    return {
      text: explanation,
      facts: [
        `Current Month: ${totalFormatted}`,
        `Previous Month: ${formatINR(summary.prevMonthTotal)}`,
        `Net Difference: ${diff > 0 ? '+' : ''}${formatINR(diff)} (${percentChange > 0 ? '+' : ''}${percentChange}%)`,
      ],
      suggestions:
        diff > 0
          ? [
              `Look at your largest single purchase this month: ${summary.largestTransaction ? `"${summary.largestTransaction.description}" (${formatINR(summary.largestTransaction.amount)})` : 'N/A'}.`,
              `Trim minor recurring spends to bring this month's average in line with last month.`,
            ]
          : [
              `Great job controlling your expenses compared to the previous period!`,
              `Consider transferring the surplus savings into a recurring deposit or emergency fund.`,
            ],
      mode: 'deterministic',
    };
  }

  // 3. "Which categories should I review?" / "Review"
  if (
    normalizedQuery.includes('which categories') ||
    normalizedQuery.includes('category should i review') ||
    normalizedQuery.includes('review') ||
    normalizedQuery.includes('cut back') ||
    normalizedQuery.includes('overspending')
  ) {
    const warningCategories = summary.categoryBreakdown.filter(
      (c) => c.budget && c.budget > 0 && (c.budgetUtilization || 0) >= 80
    );

    let text = '';
    if (warningCategories.length > 0) {
      const catList = warningCategories
        .map((c) => `${c.category} (${c.budgetUtilization}% of ${formatINR(c.budget!)})`)
        .join(', ');
      text = `You should prioritize reviewing the following categories approaching or exceeding their allocated limits: ${catList}. Spending in these areas is outpacing your monthly plan.`;
    } else if (summary.topCategory) {
      text = `No individual category has breached 80% of its budget yet. However, ${topCategoryName} is your largest expense pool at ${topCategoryAmount} (${topCategoryPct}). Inspecting non-essential spends in ${topCategoryName} is your best opportunity to optimize.`;
    } else {
      text = `No transactions have been recorded yet this month. Add expenses to receive personalized category review recommendations.`;
    }

    return {
      text,
      facts: [
        `Top Outlay: ${topCategoryName} (${topCategoryAmount})`,
        `Budget Utilization: ${summary.percentageUsed}% of ${budgetFormatted}`,
        `Active Category Budgets: ${Object.keys(budgetConfig.categoryBudgets).length}`,
      ],
      suggestions: [
        `Distinguish between essential fixed expenses (e.g. Bills/Utilities) and discretionary spending (Dining, Entertainment, Shopping).`,
        `Use the Savings Simulator tab to simulate a modest weekly reduction in ${topCategoryName}.`,
      ],
      mode: 'deterministic',
    };
  }

  // 4. "How much could I save if I reduced my food spending?" / Savings query
  if (
    normalizedQuery.includes('how much could i save') ||
    normalizedQuery.includes('save') ||
    normalizedQuery.includes('food spending') ||
    normalizedQuery.includes('reduce')
  ) {
    const foodBreakdown = summary.categoryBreakdown.find(
      (c) => c.category === 'Food and dining'
    );
    const foodSpend = foodBreakdown ? foodBreakdown.amount : 0;
    const weeklyReduction = foodSpend > 1000 ? 250 : 150;
    const fourWeeks = weeklyReduction * 4;
    const twelveWeeks = weeklyReduction * 12;

    const text = `Your recorded Food and dining spending this month is ${formatINR(foodSpend)}. If you choose to reduce optional dining and food delivery orders by ₹${weeklyReduction} per week (e.g., swapping one food delivery for home-cooked meal), you could retain approximately ${formatINR(fourWeeks)} over 4 weeks and ${formatINR(twelveWeeks)} over 3 months.`;

    return {
      text,
      facts: [
        `Current Food & Dining Spend: ${formatINR(foodSpend)}`,
        `Weekly Reduction Target: ${formatINR(weeklyReduction)}`,
        `Projected 4-Week Retained Savings: ${formatINR(fourWeeks)}`,
        `Projected 3-Month Retained Savings: ${formatINR(twelveWeeks)}`,
      ],
      suggestions: [
        `Tip: Making coffee or tea at home rather than ordering takeaway can easily save ₹150-₹300 per week.`,
        `Visit the Savings Simulator tab for real-time sliders across any spending category.`,
      ],
      mode: 'deterministic',
    };
  }

  // 5. "Suggest a realistic way to stay within my budget." / Budget advice
  if (
    normalizedQuery.includes('stay within my budget') ||
    normalizedQuery.includes('stay within budget') ||
    normalizedQuery.includes('budget advice') ||
    normalizedQuery.includes('manage budget')
  ) {
    let budgetAdvice = '';
    if (isOverBudget) {
      budgetAdvice = `You have currently exceeded your ${budgetFormatted} budget by ${remainingFormatted} (${summary.percentageUsed}% used). To prevent further deficit, pause discretionary shopping and dining for the remaining days of ${currentMonthName}.`;
    } else if (summary.percentageUsed >= 80) {
      budgetAdvice = `You have utilized ${summary.percentageUsed}% of your ${budgetFormatted} monthly budget, with ${remainingFormatted} remaining. You are in the caution zone. Limiting daily expenses to under ${formatINR(Math.round(summary.remainingBudget / 7))} over the next week will keep you safe.`;
    } else {
      budgetAdvice = `You have utilized ${summary.percentageUsed}% of your ${budgetFormatted} budget, leaving a healthy buffer of ${remainingFormatted}. Your current spending velocity is on track to stay within your limits!`;
    }

    return {
      text: budgetAdvice,
      facts: [
        `Overall Budget: ${budgetFormatted}`,
        `Spent to Date: ${totalFormatted} (${summary.percentageUsed}%)`,
        `Remaining Buffer: ${isOverBudget ? '-' : ''}${remainingFormatted}`,
      ],
      suggestions: [
        `Stick to UPI transactions with instant SMS/push tracking to stay conscious of micropayments.`,
        `Set dedicated category budgets in SpendSense for your top 3 discretionary categories.`,
      ],
      mode: 'deterministic',
    };
  }

  // 6. "Where should I invest?" / SIP & Mutual Fund queries
  if (
    normalizedQuery.includes('invest') ||
    normalizedQuery.includes('sip') ||
    normalizedQuery.includes('mutual fund') ||
    normalizedQuery.includes('nifty') ||
    normalizedQuery.includes('wealth') ||
    normalizedQuery.includes('fd vs') ||
    normalizedQuery.includes('stocks')
  ) {
    const surplus = Math.max(0, summary.remainingBudget);
    const recommendedStarterSIP = surplus >= 5000 ? 1000 : 500;
    const fiveYearWealth = Math.round(recommendedStarterSIP * 82.48); // ~12% CAGR 5-yr compounding factor

    let investText = '';
    if (isOverBudget) {
      investText = `Before initiating any fresh investments or SIPs, you should first clear your current month's deficit of ${remainingFormatted}. Once your spending is stabilized, directing even ₹500/month into a Nifty 50 Index Fund will build substantial wealth.`;
    } else {
      investText = `With ${formatINR(surplus)} remaining in your buffer this month, you can comfortably start a disciplined SIP of ${formatINR(recommendedStarterSIP)}/month in a Low-Cost Nifty 50 Index Mutual Fund (e.g. UTI Nifty 50 or Navi Nifty 50). At a historical 12% CAGR, this alone compounds to approximately ${formatINR(fiveYearWealth)} over 5 years.`;
    }

    return {
      text: investText,
      facts: [
        `Current Available Buffer: ${formatINR(surplus)}`,
        `Recommended Starter SIP: ${formatINR(recommendedStarterSIP)}/month`,
        `Asset Class Recommendation: Broad Market Index Mutual Funds (12-14% CAGR)`,
        `Estimated 5-Year Compounded Value: ${formatINR(fiveYearWealth)}`,
      ],
      suggestions: [
        `Start with Direct Mutual Funds on platforms like Groww or Zerodha Coin to save 1% in commission fees every year.`,
        `Build a 3-month emergency fund in a Liquid Mutual Fund or high-yield savings account before investing in volatile equities.`,
      ],
      mode: 'deterministic',
    };
  }

  // 7. Default: "Summarize my spending this month" / General overview
  const text = `Your recorded spending for ${currentMonthName} is ${totalFormatted} across ${summary.transactionCount} transactions. ${topCategoryName} accounts for ${topCategoryAmount} (${topCategoryPct}), making it your largest category. You have used ${summary.percentageUsed}% of your ${budgetFormatted} budget, with ${isOverBudget ? 'an excess of ' : ''}${remainingFormatted} ${isOverBudget ? 'over-budget' : 'remaining'}.${summary.prevMonthTotal !== null ? ` Spending is ${summary.percentChange! >= 0 ? '+' : ''}${summary.percentChange}% compared to last month.` : ''}`;

  return {
    text,
    facts: [
      `Month: ${currentMonthName}`,
      `Total Spending: ${totalFormatted}`,
      `Budget Utilization: ${summary.percentageUsed}% of ${budgetFormatted}`,
      `Largest Outlay: ${topCategoryName} (${topCategoryAmount})`,
      `Average Ticket: ${formatINR(summary.averageTransaction)}`,
    ],
    suggestions: [
      `Keep logging daily transactions to maintain 100% accurate financial visibility.`,
      `Check the Budgets tab to adjust your monthly allocation as needed.`,
    ],
    mode: 'deterministic',
  };
}

/**
 * Call Google Gemini API if user has supplied an API key
 */
export async function queryGeminiAPI(
  apiKey: string,
  userPrompt: string,
  summary: MonthlySummary,
  transactions: Transaction[],
  budgetConfig: BudgetConfig
): Promise<AIResponsePayload> {
  const currentMonthName = formatMonthYear(summary.yearMonth);

  // Prepare concise, structured financial facts so the LLM cannot hallucinate
  const financialContext = {
    period: currentMonthName,
    totalSpendingINR: summary.totalSpend,
    monthlyBudgetINR: summary.overallBudget,
    remainingBudgetINR: summary.remainingBudget,
    percentageUsed: summary.percentageUsed,
    previousMonthSpendingINR: summary.prevMonthTotal,
    percentChangeFromPrevMonth: summary.percentChange,
    topCategory: summary.topCategory,
    categories: summary.categoryBreakdown.map((c) => ({
      category: c.category,
      amountINR: c.amount,
      percentageOfTotal: c.percentage,
      budgetINR: c.budget || null,
      budgetUtilization: c.budgetUtilization || null,
    })),
    transactionCount: summary.transactionCount,
    averageTransactionINR: summary.averageTransaction,
    largestTransaction: summary.largestTransaction
      ? {
          amountINR: summary.largestTransaction.amount,
          category: summary.largestTransaction.category,
          description: summary.largestTransaction.description,
          date: summary.largestTransaction.date,
        }
      : null,
  };

  const systemInstruction = `You are SpendSense AI, an expert, encouraging, empathetic personal financial advisor for Indian college students, young professionals, and households.
The default currency is Indian Rupee (₹).
IMPORTANT RULES:
1. Ground all numbers strictly in the provided financialContext JSON. DO NOT invent or alter any amounts, balances, dates, or historical numbers.
2. If previousMonthSpendingINR is null, clearly explain that previous month data is not recorded or insufficient. Do not fabricate comparisons.
3. Distinguish measured facts from estimates and suggestions.
4. Keep the tone practical, concise, and non-judgmental.
5. Return a valid JSON response with the following schema:
{
  "text": "Your direct, clear 2-3 sentence answer to the user.",
  "facts": ["3-4 bullet points highlighting exact measured metrics like total spend, top category, budget used"],
  "suggestions": ["2 actionable, realistic suggestions tailored to Indian spending habits (UPI, dining, transit)"]
}`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `System Context:\n${systemInstruction}\n\nCurrent Verified Financial Data:\n${JSON.stringify(
              financialContext,
              null,
              2
            )}\n\nUser Question: "${userPrompt}"\n\nReturn strictly valid JSON matching the schema.`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Empty response from Gemini API');
    }

    const parsed = JSON.parse(candidateText);

    return {
      text: parsed.text || 'Insight generated.',
      facts: Array.isArray(parsed.facts) ? parsed.facts : [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      mode: 'gemini',
    };
  } catch (err) {
    console.warn('Gemini API call failed, falling back to deterministic engine:', err);
    // Graceful fallback to deterministic engine
    const fallback = generateDeterministicResponse(userPrompt, summary, transactions, budgetConfig);
    return {
      ...fallback,
      text: `[Automated Financial Intelligence Fallback — AI API offline or limit reached]: ${fallback.text}`,
      mode: 'deterministic',
    };
  }
}

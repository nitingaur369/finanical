import React, { useState, useMemo } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Check,
  Copy,
  Key,
  ArrowRight,
  TrendingUp,
  PiggyBank,
  ShieldCheck,
  HelpCircle,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  generateDeterministicResponse,
  queryGeminiAPI,
  AIResponsePayload,
} from '../../services/aiService';
import { formatMonthYear, formatINR } from '../../utils/formatters';
import {
  INDIAN_INVESTMENT_OPTIONS,
  FREQUENT_INVESTING_DOUBTS,
  generatePersonalizedInvestmentAdvice,
} from '../../services/investmentService';

interface ChatEntry {
  id: string;
  sender: 'user' | 'assistant';
  query?: string;
  response?: AIResponsePayload;
  timestamp: string;
}

const PRESET_EXPENSE_QUESTIONS = [
  'Where did most of my money go this month?',
  'Why did my spending increase?',
  'Which categories should I review?',
  'How much could I save if I reduced my food spending?',
  'Summarize my spending this month.',
  'Suggest a realistic way to stay within my budget.',
];

const PRESET_INVESTING_QUESTIONS = [
  'Where should I invest ₹500 to ₹1,000 each month?',
  'What is a SIP and how does it work for beginners?',
  'Should I invest in Nifty 50 Index Funds or Bank FD?',
  'How much should I keep in an emergency fund?',
  'Is my money locked in a mutual fund SIP?',
];

export const AIAssistantView: React.FC = () => {
  const {
    monthlySummary,
    transactions,
    budgets,
    selectedMonth,
    apiKey,
    setIsSettingsOpen,
  } = useApp();

  const monthName = formatMonthYear(selectedMonth);

  // Active sub-tab: 'expenses' | 'investing'
  const [subTab, setSubTab] = useState<'expenses' | 'investing'>('expenses');
  const [riskPreference, setRiskPreference] = useState<'Conservative' | 'Balanced' | 'Growth'>('Balanced');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Chat message history initialized with welcome insight
  const [messages, setMessages] = useState<ChatEntry[]>(() => {
    const initialInsight = generateDeterministicResponse(
      'Summarize my spending this month.',
      monthlySummary,
      transactions,
      budgets
    );
    return [
      {
        id: 'msg-init',
        sender: 'assistant',
        response: initialInsight,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Personalized investment plan
  const investmentPlan = useMemo(() => {
    return generatePersonalizedInvestmentAdvice(monthlySummary, riskPreference);
  }, [monthlySummary, riskPreference]);

  const handleSend = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;

    const userEntry: ChatEntry = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      query: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userEntry]);
    setInputQuery('');
    setIsLoading(true);

    try {
      let result: AIResponsePayload;

      if (apiKey) {
        result = await queryGeminiAPI(apiKey, text, monthlySummary, transactions, budgets);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 350));
        result = generateDeterministicResponse(text, monthlySummary, transactions, budgets);
      }

      const assistantEntry: ChatEntry = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        response: result,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantEntry]);
    } catch (err) {
      console.error('Error generating assistant response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Banner: Dual Mode & Status */}
      <div className="p-4 sm:p-5 rounded-3xl bg-midnight-850 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-teal to-brand-emerald flex items-center justify-center text-midnight-950 shrink-0 shadow-lg shadow-teal-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">SpendSense Financial & Wealth AI</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal border border-brand-teal/30">
                {apiKey ? 'Gemini 1.5 Flash Active' : 'Automated Financial Intelligence'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Personalized guidance on expense leakages, budget pacing, and Indian SIP & Mutual Fund investing.
            </p>
          </div>
        </div>

        {!apiKey && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-midnight-800 hover:bg-midnight-750 text-slate-300 hover:text-white border border-white/10 transition self-start sm:self-auto shrink-0"
          >
            <Key className="w-3.5 h-3.5 text-brand-teal" />
            <span>Connect Gemini Key</span>
          </button>
        )}
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex items-center gap-2 p-1 bg-midnight-900 border border-white/5 rounded-2xl max-w-md">
        <button
          onClick={() => setSubTab('expenses')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
            subTab === 'expenses'
              ? 'bg-brand-teal text-midnight-950 shadow-md shadow-teal-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Expense Doubts & Insights
        </button>
        <button
          onClick={() => setSubTab('investing')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            subTab === 'investing'
              ? 'bg-brand-teal text-midnight-950 shadow-md shadow-teal-500/10'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Investing & SIPs Guide</span>
        </button>
      </div>

      {/* VIEW A: EXPENSE DOUBTS & INSIGHTS */}
      {subTab === 'expenses' && (
        <div className="space-y-6">
          {/* Preset Expense Queries */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              Popular Expense Questions for {monthName}:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_EXPENSE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="text-xs text-left px-3.5 py-2 rounded-xl bg-midnight-850 hover:bg-midnight-800 text-slate-300 hover:text-brand-teal border border-white/10 hover:border-brand-teal/40 transition active:scale-95 disabled:opacity-50"
                >
                  “{q}”
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: INVESTING & SIP ADVISOR */}
      {subTab === 'investing' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Personalized SIP Recommendation based on user's actual surplus */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-midnight-900 via-midnight-850 to-midnight-800 border border-brand-emerald/30 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-brand-emerald flex items-center gap-1">
                    <PiggyBank className="w-4 h-4" /> Personalized Indian SIP Plan
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-semibold">
                    Surplus: {formatINR(investmentPlan.surplusINR)} left
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Recommended Starter SIP:{' '}
                  <span className="text-brand-emerald">{formatINR(investmentPlan.recommendedSIPINR)}/month</span>
                </h3>
              </div>

              {/* Risk Profile Selector */}
              <div className="flex items-center gap-1.5 p-1 bg-midnight-950 rounded-xl border border-white/10 self-start sm:self-auto">
                {(['Conservative', 'Balanced', 'Growth'] as const).map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setRiskPreference(risk)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      riskPreference === risk
                        ? 'bg-brand-emerald text-midnight-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>

            {/* Projections Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-4 rounded-2xl bg-midnight-950 border border-white/5">
                <span className="text-[11px] font-bold text-slate-400 uppercase">3-Year Compounded SIP</span>
                <div className="text-2xl font-black text-white mt-1.5">
                  {formatINR(investmentPlan.threeYearProjection)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Invested: {formatINR(investmentPlan.recommendedSIPINR * 36)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-midnight-950 border border-brand-teal/40">
                <span className="text-[11px] font-bold text-brand-teal uppercase">5-Year Compounded SIP</span>
                <div className="text-2xl font-black text-brand-teal mt-1.5">
                  {formatINR(investmentPlan.fiveYearProjection)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Invested: {formatINR(investmentPlan.recommendedSIPINR * 60)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-midnight-950 border border-brand-emerald/40">
                <span className="text-[11px] font-bold text-brand-emerald uppercase">10-Year Compounded SIP</span>
                <div className="text-2xl font-black text-brand-emerald mt-1.5">
                  {formatINR(investmentPlan.tenYearProjection)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Invested: {formatINR(investmentPlan.recommendedSIPINR * 120)}
                </p>
              </div>
            </div>

            {/* Primary Suggested Fund */}
            <div className="p-4 rounded-2xl bg-midnight-950/80 border border-brand-emerald/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-brand-emerald uppercase tracking-wider">
                  Top Recommended Instrument: {investmentPlan.primaryRecommendation.name}
                </span>
                <span className="text-slate-300">
                  Expected CAGR: {investmentPlan.primaryRecommendation.expectedReturnCAGR}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {investmentPlan.primaryRecommendation.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                <span className="text-slate-400 font-semibold">Recommended Direct Funds:</span>
                {investmentPlan.primaryRecommendation.topFunds.map((fund) => (
                  <span
                    key={fund}
                    className="px-2 py-0.5 rounded-lg bg-midnight-900 border border-white/5 text-white font-medium"
                  >
                    {fund}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Preset Investing Queries */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
              Ask AI About Indian Investing:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_INVESTING_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  disabled={isLoading}
                  className="text-xs text-left px-3.5 py-2 rounded-xl bg-midnight-850 hover:bg-midnight-800 text-slate-300 hover:text-brand-teal border border-white/10 hover:border-brand-teal/40 transition active:scale-95 disabled:opacity-50"
                >
                  “{q}”
                </button>
              ))}
            </div>
          </div>

          {/* Curated Indian Investment Options Catalog */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-teal" />
              Indian Investment Instruments Comparison
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {INDIAN_INVESTMENT_OPTIONS.map((opt) => (
                <div key={opt.id} className="glass-panel p-4 rounded-2xl flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-brand-teal">{opt.category}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          opt.risk === 'Low'
                            ? 'bg-brand-emerald/15 text-brand-emerald'
                            : opt.risk === 'Moderate'
                            ? 'bg-amber-500/15 text-amber-300'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {opt.risk} Risk
                      </span>
                    </div>
                    <h5 className="text-sm font-bold text-white mt-1">{opt.name}</h5>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{opt.description}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Expected CAGR:</span>
                      <strong className="text-white">{opt.expectedReturnCAGR}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Min Monthly SIP:</span>
                      <strong className="text-white">₹{opt.minMonthlySIP}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Lock-in Period:</span>
                      <span className="text-slate-300">{opt.lockInPeriod}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequent Doubts Accordion */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-brand-teal" />
              Common Beginner & Student Doubts
            </h4>
            <div className="divide-y divide-white/5">
              {FREQUENT_INVESTING_DOUBTS.map((doubt, idx) => {
                const isExpanded = expandedFaqIndex === idx;
                return (
                  <div key={idx} className="py-2.5">
                    <button
                      onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between gap-3 text-left text-xs font-semibold text-slate-200 hover:text-brand-teal transition"
                    >
                      <span>{doubt.q}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                    </button>
                    {isExpanded && (
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed pl-2 border-l-2 border-brand-teal">
                        {doubt.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Shared Conversation Thread */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl min-h-[420px] flex flex-col justify-between space-y-6">
        <div className="space-y-6 overflow-y-auto max-h-[550px] pr-1">
          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-xl bg-gradient-to-r from-brand-teal to-teal-600 text-midnight-950 font-semibold px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm">
                    {msg.query}
                  </div>
                </div>
              );
            }

            const resp = msg.response;
            if (!resp) return null;

            return (
              <div key={msg.id} className="flex gap-3 max-w-3xl">
                <div className="w-8 h-8 rounded-xl bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 border border-brand-teal/30 mt-1">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="flex-1 bg-midnight-900 border border-white/10 rounded-2xl rounded-tl-sm p-4 sm:p-5 space-y-4">
                  <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                    {resp.text}
                  </div>

                  {resp.facts && resp.facts.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-midnight-950/80 border border-white/5 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-brand-teal flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Verified Financial Facts ({monthName})</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {resp.facts.map((fact, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-brand-teal">•</span>
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {resp.suggestions && resp.suggestions.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-midnight-950/80 border border-white/5 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-brand-emerald flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Actionable Recommendations</span>
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {resp.suggestions.map((sug, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-brand-emerald">→</span>
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      <span>•</span>
                      <span className="capitalize">{resp.mode === 'gemini' ? 'Gemini 1.5' : 'Automated Intelligence'}</span>
                    </div>

                    <button
                      onClick={() => handleCopy(msg.id, resp.text)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-brand-emerald" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0 border border-brand-teal/30">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-midnight-900 border border-white/10 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-teal animate-ping" />
                <span>Consulting financial intelligence and calculating recommendations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputQuery);
          }}
          className="relative pt-4 border-t border-white/5"
        >
          <input
            type="text"
            placeholder={
              subTab === 'investing'
                ? "Ask anything about investing (e.g. 'Can I invest ₹500 in Nifty 50?', 'Explain SIP compounding')..."
                : "Ask anything about your expenses (e.g. 'Where did most of my money go?', 'Can I afford to dine out?')..."
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="w-full pl-4 pr-12 py-3 bg-midnight-900 border border-white/10 focus:border-brand-teal rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="absolute right-2 top-6 p-2 rounded-lg bg-brand-teal text-midnight-950 hover:bg-teal-400 disabled:opacity-40 disabled:hover:bg-brand-teal transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

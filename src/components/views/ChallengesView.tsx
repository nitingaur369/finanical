import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  Circle,
  PiggyBank,
  TrendingUp,
  Target,
  Edit2,
  Check,
  Zap,
  Flame,
  Award,
} from 'lucide-react';
import { SavingChallenge } from '../../types';
import { INITIAL_SAVING_CHALLENGES } from '../../data/challengesData';
import { formatINR } from '../../utils/formatters';
import { calculateSIPFutureValue } from '../../services/investmentService';
import confetti from 'canvas-confetti';

export const ChallengesView: React.FC = () => {
  // Load saved challenges from localStorage
  const [challenges, setChallenges] = useState<SavingChallenge[]>(() => {
    try {
      const saved = localStorage.getItem('spendsense_challenges_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SAVING_CHALLENGES;
  });

  // Goal Vault (Dream goal)
  const [goalName, setGoalName] = useState(() => {
    return localStorage.getItem('spendsense_goal_name') || 'Wireless Noise-Cancelling Earbuds';
  });
  const [goalAmount, setGoalAmount] = useState<number>(() => {
    return Number(localStorage.getItem('spendsense_goal_amount')) || 2999;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalName, setTempGoalName] = useState(goalName);
  const [tempGoalAmount, setTempGoalAmount] = useState(String(goalAmount));

  // Sync challenges
  useEffect(() => {
    try {
      localStorage.setItem('spendsense_challenges_v1', JSON.stringify(challenges));
    } catch (e) {
      console.error(e);
    }
  }, [challenges]);

  // Sync goal
  useEffect(() => {
    localStorage.setItem('spendsense_goal_name', goalName);
    localStorage.setItem('spendsense_goal_amount', String(goalAmount));
  }, [goalName, goalAmount]);

  const toggleChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id === id) {
          const newState = !ch.isCompleted;
          if (newState) {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#10B981', '#14B8A6', '#F59E0B'],
            });
          }
          return { ...ch, isCompleted: newState };
        }
        return ch;
      })
    );
  };

  const completedCount = challenges.filter((c) => c.isCompleted).length;
  const weeklyAccumulatedSavings = challenges
    .filter((c) => c.isCompleted)
    .reduce((sum, c) => sum + c.weeklySavingEstimate, 0);

  const fourWeeksAccumulated = weeklyAccumulatedSavings * 4;
  const twelveMonthsAccumulated = weeklyAccumulatedSavings * 52;

  // Compounding SIP projections if weekly savings are invested in Index Mutual Funds
  const monthlyEquivalent = weeklyAccumulatedSavings * 4.33;
  const fiveYearSIPValue = useMemo(() => {
    return calculateSIPFutureValue(Math.max(100, Math.round(monthlyEquivalent)), 12, 5).totalValue;
  }, [monthlyEquivalent]);

  const goalProgressPct = Math.min(100, Math.round((fourWeeksAccumulated / goalAmount) * 100));

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    setGoalName(tempGoalName.trim() || 'My Dream Goal');
    setGoalAmount(Math.max(500, parseFloat(tempGoalAmount) || 2999));
    setIsEditingGoal(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Hero Contest Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-midnight-900 via-midnight-850 to-midnight-800 border border-brand-teal/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-brand-teal/20 text-amber-300 border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 fill-current text-amber-400" /> Weekly Tiny Challenges Contest
              </span>
              <span className="text-xs font-bold text-slate-400">Week of October 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Micro-Savings With a Twist
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              You never have to skip essential meals, textbooks, or bills. These smart habit twists
              eliminate micro-waste and redirect forgotten rupees straight into your goal fund!
            </p>
          </div>

          {/* Quick Score Trophy Card */}
          <div className="flex items-center gap-4 bg-midnight-950/80 border border-white/10 p-4 rounded-2xl shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-brand-teal flex items-center justify-center text-midnight-950 shadow-lg shadow-teal-500/20">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400">Weekly Progress</div>
              <div className="text-2xl font-black text-white">
                {completedCount} <span className="text-sm font-medium text-slate-500">/ {challenges.length} Done</span>
              </div>
              <div className="text-xs text-brand-emerald font-bold">
                +{formatINR(weeklyAccumulatedSavings)} saved this week
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Vault Card & Compounding Multiplier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Goal Vault (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <Target className="w-5 h-5 text-brand-teal" />
              <div>
                <h3 className="text-sm font-bold text-white">Dream Goal Vault</h3>
                <p className="text-[11px] text-slate-400">What your challenge savings accumulate toward</p>
              </div>
            </div>
            {!isEditingGoal && (
              <button
                onClick={() => {
                  setTempGoalName(goalName);
                  setTempGoalAmount(String(goalAmount));
                  setIsEditingGoal(true);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
                title="Edit Goal"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isEditingGoal ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Target Goal:</span>
                <div className="text-lg font-bold text-white">{goalName}</div>
                <div className="text-xs text-brand-teal font-semibold mt-0.5">
                  Cost: {formatINR(goalAmount)}
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span>1-Month Challenge Savings:</span>
                  <span className="font-bold text-brand-emerald">{formatINR(fourWeeksAccumulated)}</span>
                </div>
                <div className="w-full bg-midnight-900 rounded-full h-3 overflow-hidden border border-white/5 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-brand-teal to-brand-emerald rounded-full transition-all duration-500"
                    style={{ width: `${goalProgressPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>{goalProgressPct}% funded</span>
                  <span>
                    {fourWeeksAccumulated >= goalAmount
                      ? '🎯 Goal Achieved this month!'
                      : `Need ${formatINR(goalAmount - fourWeeksAccumulated)} more`}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveGoal} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase">Goal Name</label>
                <input
                  type="text"
                  value={tempGoalName}
                  onChange={(e) => setTempGoalName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase">Target Amount (₹)</label>
                <input
                  type="number"
                  min="500"
                  step="100"
                  value={tempGoalAmount}
                  onChange={(e) => setTempGoalAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-midnight-900 border border-white/10 rounded-xl text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="px-3 py-1 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-bold bg-brand-teal text-midnight-950 rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="pt-3 border-t border-white/5 text-[11px] text-slate-400 flex items-center gap-1.5">
            <PiggyBank className="w-3.5 h-3.5 text-brand-emerald" />
            <span>Complete challenges below to feed money into this vault!</span>
          </div>
        </div>

        {/* Compounding Multiplier: The Micro-Savings Superpower (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-bold text-white">The Compounding Wealth Multiplier</h3>
                <p className="text-[11px] text-slate-400">See how pocket change snowballs into wealth</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-teal/20 text-brand-teal">
              12% Nifty 50 Compounding
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-midnight-950 border border-white/5">
              <span className="text-[10px] font-bold text-slate-400 uppercase">4-Week Cash Stash</span>
              <div className="text-xl font-black text-white mt-1">{formatINR(fourWeeksAccumulated)}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Direct retained bank buffer</p>
            </div>

            <div className="p-3.5 rounded-xl bg-midnight-950 border border-brand-teal/30">
              <span className="text-[10px] font-bold text-brand-teal uppercase">1-Year Direct Stash</span>
              <div className="text-xl font-black text-brand-teal mt-1">{formatINR(twelveMonthsAccumulated)}</div>
              <p className="text-[10px] text-slate-400 mt-0.5">Saved without cutting essentials</p>
            </div>

            <div className="p-3.5 rounded-xl bg-midnight-950 border border-brand-emerald/30">
              <span className="text-[10px] font-bold text-brand-emerald uppercase">5-Yr Index SIP Growth</span>
              <div className="text-xl font-black text-brand-emerald mt-1">{formatINR(fiveYearSIPValue)}</div>
              <p className="text-[10px] text-brand-emerald/80 mt-0.5">With compound equity growth</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-medium bg-midnight-950/70 p-3 rounded-xl border border-white/5">
            💡 <strong>The Secret:</strong> You don't need a huge salary to build wealth. Stashing just{' '}
            <strong className="text-white">{formatINR(weeklyAccumulatedSavings || 500)}/week</strong> into an index fund can grow to{' '}
            <strong className="text-brand-emerald">{formatINR(fiveYearSIPValue)}</strong> in 5 years!
          </p>
        </div>
      </div>

      {/* Challenges Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-teal" />
            Active Weekly Challenges ({challenges.length})
          </h3>
          <span className="text-xs text-slate-400">Click to check off challenges you crushed this week</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map((ch) => {
            return (
              <div
                key={ch.id}
                className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  ch.isCompleted
                    ? 'bg-midnight-850 border-brand-emerald/40 shadow-lg shadow-emerald-500/5'
                    : 'glass-panel hover:border-white/20'
                }`}
              >
                {/* Header with Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
                      {ch.category}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5 leading-snug">{ch.title}</h4>
                  </div>
                  <button
                    onClick={() => toggleChallenge(ch.id)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition active:scale-90 ${
                      ch.isCompleted
                        ? 'bg-brand-emerald text-midnight-950 shadow-md shadow-emerald-500/30'
                        : 'bg-midnight-900 border border-white/10 text-slate-500 hover:text-white'
                    }`}
                    title={ch.isCompleted ? 'Mark Incomplete' : 'Mark Completed!'}
                  >
                    {ch.isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <Circle className="w-5 h-5" />}
                  </button>
                </div>

                {/* The Twist Box */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <div className="font-extrabold text-amber-300 text-[11px] uppercase tracking-wider flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" /> The Smart Twist
                  </div>
                  <p className="leading-relaxed">{ch.twist}</p>
                </div>

                {/* Description & Impact */}
                <div className="space-y-2 text-xs">
                  <p className="text-slate-300 leading-relaxed">{ch.description}</p>
                  <div className="text-[11px] font-medium text-brand-teal bg-midnight-950 p-2 rounded-lg border border-white/5">
                    {ch.impactBenchmark}
                  </div>
                </div>

                {/* Bottom Bar: Estimated Savings & Check-in status */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Weekly Retained:</span>
                  <span className="font-black text-brand-emerald text-sm">
                    +{formatINR(ch.weeklySavingEstimate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

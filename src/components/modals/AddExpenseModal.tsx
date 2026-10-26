import React, { useState } from 'react';
import { X, Check, IndianRupee } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, PaymentMethod } from '../../types';
import { ALL_CATEGORIES, ALL_PAYMENT_METHODS, CATEGORY_METADATA } from '../../utils/formatters';

export const AddExpenseModal: React.FC = () => {
  const { isAddModalOpen, setIsAddModalOpen, addTransaction, selectedMonth } = useApp();

  // Initial date defaults to today or current month's latest date
  const todayStr = new Date().toISOString().slice(0, 10);
  const initialDate = todayStr.startsWith(selectedMonth) ? todayStr : `${selectedMonth}-01`;

  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food and dining');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(initialDate);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [errors, setErrors] = useState<{ amount?: string; description?: string; date?: string }>({});

  if (!isAddModalOpen) return null;

  const handleQuickAdd = (increment: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + increment));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount greater than ₹0';
    }

    if (!description.trim()) {
      newErrors.description = 'Please enter a short description or merchant name';
    }

    if (!date) {
      newErrors.date = 'Please select a valid date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addTransaction({
      amount: parsedAmount,
      category,
      description: description.trim(),
      date,
      paymentMethod,
    });

    // Reset form & close
    setAmount('');
    setDescription('');
    setErrors({});
    setIsAddModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-midnight-850 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-teal/20 text-brand-teal flex items-center justify-center text-sm font-extrabold">
                ₹
              </span>
              Add New Expense
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Record a purchase to immediately update budgets, charts & AI insights.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Amount (₹) *
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-teal font-bold text-lg pointer-events-none">
                ₹
              </div>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                autoFocus
                className={`w-full pl-9 pr-4 py-3 bg-midnight-900 border ${
                  errors.amount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/10 focus:border-brand-teal'
                } rounded-xl text-xl font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 transition`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{errors.amount}</p>
            )}

            {/* Quick chips */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] text-slate-400 font-medium">Quick add:</span>
              {[50, 100, 250, 500, 1000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => handleQuickAdd(quick)}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-midnight-800 hover:bg-midnight-750 text-slate-300 hover:text-brand-teal border border-white/5 transition"
                >
                  +₹{quick}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description / Merchant *
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy delivery, Metro card, Blinkit grocery..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              className={`w-full px-4 py-2.5 bg-midnight-900 border ${
                errors.description ? 'border-rose-500' : 'border-white/10 focus:border-brand-teal'
              } rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 transition`}
            />
            {errors.description && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const meta = CATEGORY_METADATA[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-left transition border ${
                      isSelected
                        ? 'bg-midnight-750 text-white shadow-md'
                        : 'bg-midnight-900 text-slate-400 border-white/5 hover:bg-midnight-800 hover:text-slate-200'
                    }`}
                    style={{
                      borderColor: isSelected ? meta.color : undefined,
                    }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="truncate">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className="w-full px-3.5 py-2.5 bg-midnight-900 border border-white/10 focus:border-brand-teal rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/40 transition cursor-pointer"
              />
              {errors.date && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{errors.date}</p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 bg-midnight-900 border border-white/10 focus:border-brand-teal rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/40 transition cursor-pointer"
              >
                {ALL_PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm} className="bg-midnight-900 text-white">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-teal to-brand-emerald hover:from-teal-400 hover:to-emerald-400 text-midnight-950 shadow-lg shadow-teal-500/25 active:scale-95 transition"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Save Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

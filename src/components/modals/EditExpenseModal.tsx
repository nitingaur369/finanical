import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, PaymentMethod } from '../../types';
import { ALL_CATEGORIES, ALL_PAYMENT_METHODS, CATEGORY_METADATA } from '../../utils/formatters';

export const EditExpenseModal: React.FC = () => {
  const { editingTransaction, setEditingTransaction, updateTransaction } = useApp();

  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food and dining');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [errors, setErrors] = useState<{ amount?: string; description?: string; date?: string }>({});

  useEffect(() => {
    if (editingTransaction) {
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
      setPaymentMethod(editingTransaction.paymentMethod || 'UPI');
      setErrors({});
    }
  }, [editingTransaction]);

  if (!editingTransaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount greater than ₹0';
    }

    if (!description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!date) {
      newErrors.date = 'Please select a valid date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateTransaction(editingTransaction.id, {
      amount: parsedAmount,
      category,
      description: description.trim(),
      date,
      paymentMethod,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-midnight-850 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Edit Expense Record</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Modify details to immediately recalculate category totals and budgets.
            </p>
          </div>
          <button
            onClick={() => setEditingTransaction(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
          {/* Amount */}
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
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                className={`w-full pl-9 pr-4 py-3 bg-midnight-900 border ${
                  errors.amount ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/10 focus:border-brand-teal'
                } rounded-xl text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-teal/40 transition`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{errors.amount}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description / Merchant *
            </label>
            <input
              type="text"
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

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              onClick={() => setEditingTransaction(null)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-teal to-brand-emerald hover:from-teal-400 hover:to-emerald-400 text-midnight-950 shadow-lg shadow-teal-500/25 active:scale-95 transition"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Update Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatDate } from '../../utils/formatters';

export const DeleteConfirmModal: React.FC = () => {
  const { deletingTransactionId, setDeletingTransactionId, deleteTransaction, transactions } = useApp();

  if (!deletingTransactionId) return null;

  const target = transactions.find((t) => t.id === deletingTransactionId);
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-midnight-850 border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Delete Expense?</h3>
            <p className="text-xs text-slate-400">This action will remove the record and recalculate your dashboard totals.</p>
          </div>
        </div>

        {/* Expense Card Preview */}
        <div className="p-3.5 rounded-xl bg-midnight-900 border border-white/5 my-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-white truncate max-w-[200px]">{target.description}</span>
            <span className="font-bold text-rose-400">{formatINR(target.amount)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
            <span>{target.category}</span>
            <span>{formatDate(target.date)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setDeletingTransactionId(null)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deleteTransaction(target.id)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 active:scale-95 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

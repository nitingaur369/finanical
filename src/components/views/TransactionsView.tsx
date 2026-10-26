import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Calendar,
  Receipt,
  Edit3,
  Trash2,
  X,
  CreditCard,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, PaymentMethod, Transaction } from '../../types';
import {
  ALL_CATEGORIES,
  ALL_PAYMENT_METHODS,
  CATEGORY_METADATA,
  formatINR,
  formatDate,
} from '../../utils/formatters';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    selectedMonth,
    setIsAddModalOpen,
    setEditingTransaction,
    setDeletingTransactionId,
  } = useApp();

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Search Query
      if (
        searchQuery.trim() &&
        !tx.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) &&
        !tx.category.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ) {
        return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) {
        return false;
      }

      // 3. Payment Method Filter
      if (selectedPayment !== 'ALL' && tx.paymentMethod !== selectedPayment) {
        return false;
      }

      // 4. Date range filter
      if (startDate && tx.date < startDate) {
        return false;
      }
      if (endDate && tx.date > endDate) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [transactions, searchQuery, selectedCategory, selectedPayment, startDate, endDate, sortBy]);

  // Aggregate total of filtered transactions
  const filteredTotal = useMemo(() => {
    return filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedPayment('ALL');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'ALL' ||
    selectedPayment !== 'ALL' ||
    startDate ||
    endDate;

  // Export to CSV helper
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['Date', 'Description', 'Category', 'Amount (INR)', 'Payment Method'];
    const rows = filteredTransactions.map((tx) => [
      tx.date,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.category,
      tx.amount,
      tx.paymentMethod || 'UPI',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SpendSense_Transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls Bar: Search, Add CTA, Export */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by description or merchant (e.g. Swiggy, Metro, Netflix)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-midnight-900 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-teal/50 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportToCSV}
            title="Download CSV"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-midnight-800 hover:bg-midnight-750 text-slate-300 hover:text-white border border-white/10 transition"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-brand-teal to-brand-emerald hover:from-teal-400 hover:to-emerald-400 text-midnight-950 shadow-md shadow-teal-500/20 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Category pills, Date range, Sort */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Filter className="w-3.5 h-3.5 text-brand-teal" />
            <span>Filter by Category:</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-brand-teal hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3 h-3" /> Reset all filters
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedCategory === 'ALL'
                ? 'bg-brand-teal text-midnight-950 font-bold shadow-sm'
                : 'bg-midnight-900 text-slate-400 hover:text-slate-200 border border-white/5'
            }`}
          >
            All Categories ({transactions.length})
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const count = transactions.filter((t) => t.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-midnight-750 text-white border border-brand-teal'
                    : 'bg-midnight-900 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: CATEGORY_METADATA[cat]?.color }}
                />
                <span>{cat}</span>
                {count > 0 && <span className="text-[10px] opacity-60">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Date Range, Payment Method & Sorting Sub-row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-midnight-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-midnight-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full px-3 py-1.5 bg-midnight-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              <option value="ALL">All Payment Methods</option>
              {ALL_PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-midnight-900 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-teal"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Amount: Highest First</option>
              <option value="amount-asc">Amount: Lowest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Records Overview Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong>{filteredTransactions.length}</strong> matching transaction{filteredTransactions.length === 1 ? '' : 's'}
        </span>
        <span>
          Filtered Total: <strong className="text-white text-sm">{formatINR(filteredTotal)}</strong>
        </span>
      </div>

      {/* Transactions List */}
      <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-white/5">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => {
            const meta = CATEGORY_METADATA[tx.category];
            return (
              <div
                key={tx.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: meta.bgColor,
                      borderColor: meta.borderColor,
                      color: meta.textColor,
                    }}
                  >
                    <span className="text-xs font-bold">{tx.category.slice(0, 1)}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                        {tx.description}
                      </h4>
                      {tx.isSample && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/5 shrink-0">
                          Demo
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-1">
                      <span className="font-medium text-slate-300">{tx.category}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date, 'medium')}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-midnight-900 border border-white/5 text-[10px] font-medium text-slate-300">
                        {tx.paymentMethod || 'UPI'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-bold text-white">
                      {formatINR(tx.amount)}
                    </div>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingTransaction(tx)}
                      className="p-2 rounded-lg text-slate-400 hover:text-brand-teal hover:bg-white/5 transition"
                      title="Edit expense"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTransactionId(tx.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-midnight-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-white">No transactions found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No recorded expenses match your selected filters. Try clearing some filters or searching for another term.'
                : 'No transactions recorded yet. Click the Add Expense button above to get started!'}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-midnight-800 text-brand-teal hover:bg-midnight-750 transition"
              >
                Clear all filters
              </button>
            ) : (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-teal text-midnight-950 hover:bg-teal-400 transition"
              >
                + Add First Expense
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

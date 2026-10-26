import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Wallet,
  Copy,
  X,
  Split,
  UserPlus,
  Receipt,
  TrendingUp,
  BadgeIndianRupee,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';

/* ────────────── Types ────────────── */
interface Friend {
  id: string;
  name: string;
  emoji: string;
  share: number;
  paid: boolean;
}

interface SplitSession {
  id: string;
  title: string;
  description: string;
  totalAmount: number;
  date: string;
  splitType: 'equal' | 'custom';
  friends: Friend[];
  paidByMe: boolean;
  createdAt: string;
}

/* ────────────── Helpers ────────────── */
const FRIEND_EMOJIS = ['👦', '👧', '🧑', '👩', '👨', '🧔', '👱', '🧕', '👴', '👵', '🧒', '🐻'];
const COLORS = [
  'from-violet-500/20 to-purple-500/20 border-violet-500/30',
  'from-brand-teal/20 to-brand-emerald/20 border-brand-teal/30',
  'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  'from-indigo-500/20 to-blue-500/20 border-indigo-500/30',
];

const uid = () => 'sp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
const today = () => new Date().toISOString().slice(0, 10);

const DEMO_SESSIONS: SplitSession[] = [
  {
    id: 'demo-1',
    title: 'Goa Trip',
    description: 'Hotel + food + beach activities',
    totalAmount: 24000,
    date: '2026-10-20',
    splitType: 'equal',
    paidByMe: true,
    createdAt: new Date().toISOString(),
    friends: [
      { id: 'f1', name: 'Arjun', emoji: '👦', share: 6000, paid: true },
      { id: 'f2', name: 'Priya', emoji: '👧', share: 6000, paid: false },
      { id: 'f3', name: 'Rohit', emoji: '🧔', share: 6000, paid: false },
    ],
  },
  {
    id: 'demo-2',
    title: 'Birthday Dinner',
    description: 'Taj restaurant, Connaught Place',
    totalAmount: 8500,
    date: '2026-10-15',
    splitType: 'custom',
    paidByMe: true,
    createdAt: new Date().toISOString(),
    friends: [
      { id: 'f4', name: 'Sneha', emoji: '👩', share: 2000, paid: true },
      { id: 'f5', name: 'Kiran', emoji: '🧑', share: 3000, paid: true },
      { id: 'f6', name: 'Dev', emoji: '👱', share: 3500, paid: false },
    ],
  },
];

/* ────────────── Status Badge ────────────── */
const StatusBadge: React.FC<{ paid: boolean }> = ({ paid }) => (
  <span
    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
      paid
        ? 'bg-green-500/20 text-green-400 border border-green-400/30'
        : 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
    }`}
  >
    {paid ? <CheckCircle className="w-2.5 h-2.5" /> : <Circle className="w-2.5 h-2.5" />}
    {paid ? 'Paid' : 'Pending'}
  </span>
);

/* ────────────── Create Session Modal ────────────── */
interface CreateModalProps {
  onClose: () => void;
  onCreate: (session: SplitSession) => void;
}

const CreateSessionModal: React.FC<CreateModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [date, setDate] = useState(today());
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [paidByMe, setPaidByMe] = useState(true);
  const [friendName, setFriendName] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState('');

  const total = parseFloat(totalAmount) || 0;
  const peopleCount = friends.length + 1;
  const equalShare = peopleCount > 0 ? Math.round((total / peopleCount) * 100) / 100 : 0;
  const friendsTotal = friends.reduce((s, f) => s + f.share, 0);
  const myShare = total - friendsTotal;

  const addFriend = () => {
    const name = friendName.trim();
    if (!name) return;
    if (friends.find((f) => f.name.toLowerCase() === name.toLowerCase())) {
      setError('Friend already added.');
      return;
    }
    const emoji = FRIEND_EMOJIS[friends.length % FRIEND_EMOJIS.length];
    setFriends((prev) => [...prev, { id: uid(), name, emoji, share: 0, paid: false }]);
    setFriendName('');
    setError('');
  };

  const removeFriend = (id: string) => setFriends((prev) => prev.filter((f) => f.id !== id));

  const updateShare = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, share: num } : f)));
  };

  const handleSubmit = () => {
    if (!title.trim()) { setError('Please enter a title.'); return; }
    if (!total || total <= 0) { setError('Please enter a valid amount.'); return; }
    if (friends.length === 0) { setError('Add at least one friend.'); return; }

    const resolvedFriends: Friend[] = friends.map((f) => ({
      ...f,
      share: splitType === 'equal' ? equalShare : f.share,
    }));

    onCreate({
      id: uid(),
      title: title.trim(),
      description: description.trim(),
      totalAmount: total,
      date,
      splitType,
      paidByMe,
      createdAt: new Date().toISOString(),
      friends: resolvedFriends,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-midnight-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-teal/30 to-brand-emerald/30 flex items-center justify-center">
              <Split className="w-4 h-4 text-brand-teal" />
            </div>
            <h2 className="text-lg font-bold text-white">New Split</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Bill / Trip Name *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Goa Trip, Movie Night…"
              className="w-full bg-midnight-800 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal/60 placeholder:text-slate-500" />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details…"
              className="w-full bg-midnight-800 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal/60 placeholder:text-slate-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Total Amount (₹) *</label>
              <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0" min="1"
                className="w-full bg-midnight-800 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal/60 placeholder:text-slate-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full bg-midnight-800 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal/60" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Split Method</label>
            <div className="flex gap-2">
              {(['equal', 'custom'] as const).map((type) => (
                <button key={type} onClick={() => setSplitType(type)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${splitType === type ? 'bg-brand-teal/20 border-brand-teal/50 text-brand-teal' : 'bg-midnight-800 border-white/10 text-slate-400 hover:text-white'}`}>
                  {type === 'equal' ? '⚖️ Equal Split' : '✏️ Custom Amounts'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-midnight-800 border border-white/10">
            <Wallet className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-sm text-slate-300 flex-1">You paid the entire bill</span>
            <button onClick={() => setPaidByMe(!paidByMe)}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${paidByMe ? 'bg-brand-teal' : 'bg-slate-700'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${paidByMe ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Add Friends *</label>
            <div className="flex gap-2">
              <input type="text" value={friendName} onChange={(e) => setFriendName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addFriend()} placeholder="Friend's name…"
                className="flex-1 bg-midnight-800 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-teal/60 placeholder:text-slate-500" />
              <button onClick={addFriend} className="px-4 py-2.5 rounded-xl bg-brand-teal/20 border border-brand-teal/40 text-brand-teal hover:bg-brand-teal/30 transition">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {friends.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-brand-teal/10 border border-brand-teal/20">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧑‍💻</span>
                  <span className="text-sm font-semibold text-white">You</span>
                </div>
                <span className="text-sm font-bold text-brand-teal">{formatINR(splitType === 'equal' ? equalShare : Math.max(0, myShare))}</span>
              </div>

              {friends.map((f) => (
                <div key={f.id} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-midnight-800 border border-white/10">
                  <span className="text-lg">{f.emoji}</span>
                  <span className="text-sm font-medium text-slate-200 flex-1">{f.name}</span>
                  {splitType === 'custom' ? (
                    <input type="number" value={f.share || ''} onChange={(e) => updateShare(f.id, e.target.value)} placeholder="₹"
                      className="w-24 bg-midnight-900 border border-white/10 text-white text-sm rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-teal/60" />
                  ) : (
                    <span className="text-sm font-bold text-brand-teal">{formatINR(equalShare)}</span>
                  )}
                  <button onClick={() => removeFriend(f.id)} className="p-1 text-slate-500 hover:text-rose-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {splitType === 'equal' && total > 0 && (
                <p className="text-xs text-slate-400 text-center">
                  {formatINR(total)} ÷ {peopleCount} people = <strong className="text-white">{formatINR(equalShare)}</strong> each
                </p>
              )}
            </div>
          )}

          {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
        </div>

        <div className="flex gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 border border-white/10 hover:bg-white/5 transition">Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-teal to-brand-emerald text-midnight-950 hover:opacity-90 transition shadow-lg shadow-teal-500/20">Create Split</button>
        </div>
      </div>
    </div>
  );
};

/* ────────────── Session Card ────────────── */
interface SessionCardProps {
  session: SplitSession;
  colorClass: string;
  onTogglePaid: (sessionId: string, friendId: string) => void;
  onDelete: (id: string) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, colorClass, onTogglePaid, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const totalCollected = session.friends.filter((f) => f.paid).reduce((s, f) => s + f.share, 0);
  const totalOwed = session.friends.filter((f) => !f.paid).reduce((s, f) => s + f.share, 0);
  const paidCount = session.friends.filter((f) => f.paid).length;
  const allPaid = paidCount === session.friends.length;
  const collectPct = session.totalAmount > 0 ? Math.min(100, (totalCollected / session.totalAmount) * 100) : 0;

  const copyUPI = (name: string, amount: number) => {
    const text = `Hi ${name}, please send ${formatINR(amount)} for "${session.title}" via UPI. Thanks! 🙏`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${colorClass} p-5 transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-bold text-white truncate">{session.title}</h3>
            {allPaid && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-500/25 text-green-400 border border-green-400/30">✅ Settled</span>
            )}
          </div>
          {session.description && <p className="text-xs text-slate-400 truncate">{session.description}</p>}
          <p className="text-xs text-slate-500 mt-1">{new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <button onClick={() => onDelete(session.id)} className="ml-2 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Total', value: formatINR(session.totalAmount), color: 'text-white' },
          { label: 'Collected', value: formatINR(totalCollected), color: 'text-green-400' },
          { label: 'Pending', value: formatINR(totalOwed), color: totalOwed > 0 ? 'text-amber-400' : 'text-green-400' },
        ].map((item) => (
          <div key={item.label} className="text-center p-2 rounded-xl bg-black/20">
            <p className="text-[10px] text-slate-400 mb-0.5">{item.label}</p>
            <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>{paidCount}/{session.friends.length} friends paid</span>
          <span>{Math.round(collectPct)}% collected</span>
        </div>
        <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-teal to-brand-emerald rounded-full transition-all duration-500" style={{ width: `${collectPct}%` }} />
        </div>
      </div>

      <button onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition mb-2">
        {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Hide Friends</> : <><ChevronDown className="w-3.5 h-3.5" /> View Friends ({session.friends.length})</>}
      </button>

      {expanded && (
        <div className="space-y-2 mt-2">
          {session.friends.map((f) => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/25 border border-white/5">
              <span className="text-xl shrink-0">{f.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{f.name}</p>
                <p className="text-xs text-slate-400">{formatINR(f.share)}</p>
              </div>
              <StatusBadge paid={f.paid} />
              {!f.paid && (
                <button onClick={() => copyUPI(f.name, f.share)} title="Copy UPI reminder" className="p-1.5 rounded-lg text-slate-500 hover:text-brand-teal hover:bg-brand-teal/10 transition">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => onTogglePaid(session.id, f.id)} title={f.paid ? 'Mark pending' : 'Mark paid'}
                className={`p-1.5 rounded-lg transition ${f.paid ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20' : 'text-slate-500 hover:text-green-400 hover:bg-green-500/10'}`}>
                {f.paid ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ────────────── Main View ────────────── */
export const SplitBillView: React.FC = () => {
  const [sessions, setSessions] = useState<SplitSession[]>(DEMO_SESSIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'settled'>('all');

  const settledCount = sessions.filter((s) => s.friends.every((f) => f.paid)).length;
  const pendingCount = sessions.length - settledCount;

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const allPaid = s.friends.every((f) => f.paid);
      if (filter === 'pending') return !allPaid;
      if (filter === 'settled') return allPaid;
      return true;
    });
  }, [sessions, filter]);

  const totalOwedToMe = sessions
    .filter((s) => s.paidByMe)
    .reduce((acc, s) => acc + s.friends.filter((f) => !f.paid).reduce((s2, f) => s2 + f.share, 0), 0);

  const handleCreate = (session: SplitSession) => {
    setSessions((prev) => [session, ...prev]);
    setIsModalOpen(false);
  };

  const handleTogglePaid = (sessionId: string, friendId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, friends: s.friends.map((f) => (f.id === friendId ? { ...f, paid: !f.paid } : f)) }
          : s
      )
    );
  };

  const handleDelete = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500/30 to-purple-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-violet-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Split Bills</h1>
          </div>
          <p className="text-sm text-slate-400 ml-12">Split expenses with friends — track who's paid up.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-brand-teal to-brand-emerald text-midnight-950 hover:opacity-90 transition shadow-lg shadow-teal-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Split
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Pending from Friends', value: formatINR(totalOwedToMe), icon: <BadgeIndianRupee className="w-4 h-4" />, color: 'text-amber-400', bg: 'from-amber-500/10 to-orange-500/10 border-amber-500/20' },
          { label: 'Active Splits', value: String(pendingCount), icon: <Split className="w-4 h-4" />, color: 'text-brand-teal', bg: 'from-brand-teal/10 to-brand-emerald/10 border-brand-teal/20' },
          { label: 'Settled Splits', value: String(settledCount), icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400', bg: 'from-green-500/10 to-teal-500/10 border-green-500/20' },
          { label: 'Total Splits', value: String(sessions.length), icon: <Receipt className="w-4 h-4" />, color: 'text-violet-400', bg: 'from-violet-500/10 to-purple-500/10 border-violet-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`p-4 rounded-2xl border bg-gradient-to-br ${stat.bg}`}>
            <div className={`flex items-center gap-2 mb-2 ${stat.color}`}>
              {stat.icon}
              <span className="text-xs font-semibold text-slate-400">{stat.label}</span>
            </div>
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-midnight-800/60 border border-white/5">
        <TrendingUp className="w-4 h-4 text-brand-teal mt-0.5 shrink-0" />
        <p className="text-xs text-slate-400">
          <strong className="text-slate-200">Tip:</strong> Expand any split to see friend details, mark them as paid, or copy a ready-made UPI reminder message to send them.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 bg-midnight-900 border border-white/10 rounded-xl p-1 w-fit">
        {(['all', 'pending', 'settled'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition ${filter === f ? 'bg-brand-teal/20 text-brand-teal border border-brand-teal/30' : 'text-slate-400 hover:text-white'}`}>
            {f === 'all' ? `All (${sessions.length})` : f === 'pending' ? `Active (${pendingCount})` : `Settled (${settledCount})`}
          </button>
        ))}
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-midnight-800 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-300 mb-2">No splits here</h3>
          <p className="text-sm text-slate-500 max-w-xs">
            {filter === 'settled'
              ? 'No settled splits yet — mark friends as paid to settle a split.'
              : 'Create your first split to start tracking shared expenses with friends.'}
          </p>
          {filter === 'all' && (
            <button onClick={() => setIsModalOpen(true)}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-teal/20 text-brand-teal border border-brand-teal/40 hover:bg-brand-teal/30 transition">
              <Plus className="w-4 h-4" />
              Create First Split
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session, idx) => (
            <SessionCard
              key={session.id}
              session={session}
              colorClass={COLORS[idx % COLORS.length]}
              onTogglePaid={handleTogglePaid}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && <CreateSessionModal onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />}
    </div>
  );
};

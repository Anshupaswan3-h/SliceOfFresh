/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Pencil, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Calendar,
  FileText,
  ChevronRight,
  Search,
  X
} from 'lucide-react';

// --- Types ---

type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category?: string;
  date: string;
  createdAt: number;
}

// --- Constants ---

const QUOTES = [
  "Start small, think big, act daily",
  "Action brings success, not ideas alone",
  "Keep going, even when it’s hard",
  "Progress matters more than perfection",
  "Fail, learn, improve, repeat again",
  "Solve problems, create real value",
  "Stay consistent, success will follow",
  "Focus on one thing at a time",
  "Hard work builds strong results",
  "Discipline creates long term success",
  "Turn ideas into real action",
  "Don’t stop until you finish",
  "Learn every day, grow every day",
  "Small steps create big change",
  "Success comes from steady effort",
  "Think simple, act smart",
  "Build today, improve tomorrow",
  "Stay patient, stay focused",
  "Keep improving, never stay same",
  "Results come from execution",
  "Dream, plan, then do",
  "Keep learning from mistakes",
  "Push yourself beyond comfort",
  "Work hard in silence",
  "Every effort counts",
  "Consistency creates real growth",
  "Make action your habit",
  "Stay focused on goals",
  "Don’t wait, start now",
  "Success needs time and effort"
];

// --- Components ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div id="card-container" className={`bg-white rounded-3xl p-6 border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const TypingQuotes = () => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [progress, setProgress] = useState(0);

  const typingSpeed = 60;
  const deletingSpeed = 30;
  const waitTime = 30000; // 30 seconds

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const currentQuote = QUOTES[index];
    
    if (!isDeleting && !isWaiting) {
      if (displayText.length < currentQuote.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentQuote.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        setIsWaiting(true);
        setProgress(0);
      }
    } else if (isWaiting) {
      const interval = 100;
      timeout = setTimeout(() => {
        setProgress(prev => {
          const next = prev + (interval / waitTime) * 100;
          if (next >= 100) {
            setIsWaiting(false);
            setIsDeleting(true);
            return 100;
          }
          return next;
        });
      }, interval);
    } else if (isDeleting) {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setProgress(0);
        // Pick a new random index different from current
        setIndex((prev) => {
          let next = Math.floor(Math.random() * QUOTES.length);
          while (next === prev) {
            next = Math.floor(Math.random() * QUOTES.length);
          }
          return next;
        });
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, isWaiting, index, progress]);

  return (
    <div className="flex flex-col items-center mt-0 w-full px-4 text-center">
      <div className="relative inline-block pb-1">
        <p className="text-indigo-600 text-base font-extrabold italic tracking-tight text-center leading-snug font-display">
          "{displayText}"
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="inline-block w-0.5 h-4 bg-indigo-400 ml-1 translate-y-0.5"
          />
        </p>
        
        {/* Underline Seekbar showing time to change */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200/40 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-indigo-500"
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: isWaiting ? `${progress}%` : '0%',
              opacity: isWaiting ? 1 : 0
            }}
            transition={{ 
              width: { ease: "linear", duration: isWaiting ? 0.1 : 0 },
              opacity: { duration: 0.3 }
            }}
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, amount, type, icon: Icon }: { title: string; amount: number; type: 'income' | 'expense' | 'balance'; icon: any }) => {
  const isNegative = type === 'balance' ? amount < 0 : false;
  const isPositive = type === 'balance' ? amount > 0 : false;

  return (
    <div 
      id={`stat-card-${type}`} 
      className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col gap-1 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        <div className={`p-1.5 rounded-lg ${
          type === 'income' ? 'bg-emerald-50 text-emerald-600' : 
          type === 'expense' ? 'bg-rose-50 text-rose-600' : 
          'bg-slate-100 text-slate-600'
        }`}>
          <Icon size={14} strokeWidth={2} />
        </div>
      </div>
      <div className="flex flex-col">
        <span id={`stat-amount-${type}`} className={`text-xl font-black tracking-tighter sm:text-3xl font-display ${
          type === 'balance' ? (isNegative ? 'text-rose-600' : isPositive ? 'text-emerald-600' : 'text-slate-900') : 'text-slate-900'
        }`}>
          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}
        </span>
      </div>
    </div>
  );
};

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as TransactionType
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const openAddModal = (type: TransactionType) => {
    setEditingId(null);
    setFormData({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: type
    });
    setIsModalOpen(true);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/transactions');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || data.details || 'Failed to fetch from Supabase');
      }
      
      setTransactions(data);
      // Sync to local storage as backup
      localStorage.setItem('fintrack_transactions', JSON.stringify(data));
      setError(null);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      const isMissingTable = err.message?.includes("could not find the table") || err.message?.includes("relation \"public.transactions\" does not exist");
      
      if (isMissingTable) {
        setError("Supabase Setup Required: Please run the SQL from 'supabase_schema.sql' in your Supabase SQL Editor to create the transactions table.");
      } else {
        setError(err.message);
      }
      
      // Fallback to local storage
      const saved = localStorage.getItem('fintrack_transactions');
      if (saved) setTransactions(JSON.parse(saved));
    } finally {
      setLoading(false);
    }
  };

  const syncToSupabase = async (updatedList: Transaction[]) => {
    try {
      const res = await fetch('/api/transactions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: updatedList })
      });
      if (!res.ok) throw new Error('Sync failed');
      localStorage.setItem('fintrack_transactions', JSON.stringify(updatedList));
    } catch (err) {
      console.error('Sync Error:', err);
    }
  };

  const deleteFromSupabase = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  const groupedTransactions = useMemo(() => {
    const sorted = [...transactions]
      .filter(t => t.type === activeTab)
      .filter(t => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(query) ||
          t.amount.toString().includes(query) ||
          t.date.includes(query)
        );
      })
      .sort((a, b) => {
        // Default sort by date string
        if (b.date !== a.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        // Then sort by creation time for items on the same day
        return b.createdAt - a.createdAt;
      });

    const groups: { date: string; items: Transaction[] }[] = [];
    sorted.forEach(t => {
      let group = groups.find(g => g.date === t.date);
      if (!group) {
        group = { date: t.date, items: [] };
        groups.push(group);
      }
      group.items.push(t);
    });

    return {
      groups,
      total: sorted.length
    };
  }, [transactions, activeTab, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.date) return;

    if (editingId) {
      const transactionToEdit = transactions.find(t => t.id === editingId);
      if (transactionToEdit) {
        const updatedTransaction = {
          ...transactionToEdit,
          amount: parseFloat(formData.amount),
          description: formData.description,
          date: formData.date,
          type: formData.type
        };
        const newList = transactions.map(t => t.id === editingId ? updatedTransaction : t);
        setTransactions(newList);
        syncToSupabase(newList);
      }
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        createdAt: Date.now()
      };
      const newList = [...transactions, newTransaction];
      setTransactions(newList);
      syncToSupabase(newList);
    }

    setFormData({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: activeTab
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!editingId) return;
    const newList = transactions.filter(t => t.id !== editingId);
    setTransactions(newList);
    deleteFromSupabase(editingId);
    setIsModalOpen(false);
    setEditingId(null);
  };

  const openEditModal = (t: Transaction) => {
    setEditingId(t.id);
    setFormData({
      amount: t.amount.toString(),
      description: t.description,
      date: t.date,
      type: t.type
    });
    setIsModalOpen(true);
  };

  const formatDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    
    return new Date(dateStr).toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  const { groups, total: transactionCount } = groupedTransactions;

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <div id="app-container" className="max-w-4xl mx-auto px-4 pt-1 md:pt-2 pb-20">
        
        <div id="title-container" className="flex flex-col items-center mb-4">
          <h1 
            id="app-title" 
            className="text-4xl md:text-6xl font-extrabold tracking-tighter text-indigo-900 font-display select-none drop-shadow-sm"
          >
            Slice Of Fresh
          </h1>
          <TypingQuotes />
        </div>
        
        <div id="tab-switcher-wrapper" className="sticky top-0 z-30 -mx-4 px-4 bg-slate-50/90 backdrop-blur-sm pb-2 mb-2">
          <div id="tab-switcher-container" className="flex justify-center">
            <div id="tab-switcher" className="relative flex bg-slate-200 p-1 rounded-xl w-full max-w-xs transition-all">
              {['expense', 'income'].map((tab) => (
                <button
                  key={tab}
                  id={`tab-btn-${tab}`}
                  onClick={() => setActiveTab(tab as TransactionType)}
                  className={`relative flex-1 py-2 text-xs font-bold uppercase tracking-wider z-10 transition-all ${
                    activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-tab"
                      id="active-tab-indicator"
                      className="absolute inset-0 bg-indigo-600 rounded-lg z-[-1]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
 
        {/* Stats Grid */}
        <div id="stats-container" className="space-y-3 mb-6">
          <div id="stats-row-1">
            <StatCard title="Net Profit" amount={stats.balance} type="balance" icon={Wallet} />
          </div>
          <div id="stats-row-2" className="grid grid-cols-2 gap-3">
            <StatCard title="Income" amount={stats.income} type="income" icon={TrendingUp} />
            <StatCard title="Spending" amount={stats.expense} type="expense" icon={TrendingDown} />
          </div>
        </div>

        {/* Action Button */}
        <div id="action-button-container" className="mb-6">
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => openAddModal(activeTab)}
            className={`w-full flex items-center justify-center gap-2 py-4 text-white rounded-2xl font-bold shadow-md transition-all ${
              activeTab === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Plus size={22} strokeWidth={3} />
            <span>Add {activeTab === 'expense' ? 'Expense' : 'Income'}</span>
          </motion.button>
        </div>
 
        <div id="main-content" className="max-w-2xl mx-auto space-y-8">
          
          {/* Transaction List */}
          <div id="list-column">
            <div id="list-header" className="flex flex-col mb-8 px-2 gap-6">
              <div className="flex items-center justify-between">
                <h2 id="list-title" className="text-lg font-bold text-gray-900 capitalize">Recent {activeTab}s</h2>
              </div>
              
              <div id="search-container" className="relative w-full">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}s...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
 
            <div id="transactions-viewport" className="space-y-8">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 italic text-slate-400">
                  Loading data from Supabase...
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-10 bg-rose-50 rounded-3xl border border-rose-100 text-rose-600 text-center px-4">
                  <div className="max-w-md mx-auto">
                    <p className="font-bold text-lg mb-2">Supabase Setup Required</p>
                    <p className="text-sm mb-6 opacity-80">The 'transactions' table was not found in your Supabase project. Please run the following SQL script in your Supabase SQL Editor.</p>
                    
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-left font-mono text-xs overflow-x-auto mb-6 select-all">
                      {`create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  amount numeric not null,
  description text not null,
  date text not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.transactions enable row level security;
create policy "Allow anon access" on public.transactions for all using (true);`}
                    </div>
                    
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-6 py-2 bg-rose-600 text-white rounded-full font-medium hover:bg-rose-700 transition-colors"
                    >
                      I've run the script, reload app
                    </button>
                    
                    <p className="mt-4 text-xs text-rose-400 italic">
                      Technical error: {error}
                    </p>
                  </div>
                </div>
              ) : transactionCount > 0 ? (
                groups.map(({ date, items }) => (
                  <div 
                    key={date} 
                    id={`group-${date}`}
                    className="space-y-3"
                  >
                    <div className="flex items-center gap-4 px-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        {formatDateLabel(date)}
                      </span>
                      <div className="h-px w-full bg-gray-200" />
                    </div>
 
                    <div className="space-y-3">
                      {items.map((t) => (
                        <div
                          key={t.id}
                          id={`transaction-item-${t.id}`}
                          className="group bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                          onClick={() => openEditModal(t)}
                        >
                          <div className="flex items-center gap-4">
                            <div id={`item-icon-${t.id}`} className={`p-3 rounded-lg transition-colors ${
                              t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {t.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            </div>
                            <div>
                              <p id={`item-desc-${t.id}`} className="font-semibold text-slate-800 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                                {t.description}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                                {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span id={`item-amount-${t.id}`} className={`font-bold text-xl tracking-tight ${
                              t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                            <div className="p-2 text-slate-300 group-hover:text-indigo-500 transition-colors">
                              <ChevronRight size={18} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  id="empty-state"
                  className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center"
                >
                  <div id="empty-icon" className="p-4 bg-gray-50 rounded-full text-gray-300 mb-4">
                    <ChevronRight size={32} />
                  </div>
                  <p className="text-gray-400 font-medium">
                    {searchQuery ? 'No results match your search.' : `No ${activeTab}s recorded yet.`}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {searchQuery ? 'Try a different keyword.' : 'Click the + button to get started.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div id="modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              id="modal-backdrop"
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <div
              id="modal-content"
              className="relative w-full max-w-md"
            >
              <Card className="border-none">
                <div className="flex items-center justify-between mb-6">
                  <h2 id="form-title" className="text-xl font-bold flex items-center gap-2">
                     {editingId ? 'Edit' : 'Add'} {activeTab}
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    activeTab === 'expense' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {activeTab}
                  </div>
                </div>
                
                <form id="transaction-form" onSubmit={handleSubmit} className="space-y-5">
                  <div id="form-group-amount" className="space-y-1.5">
                    <label htmlFor="amount" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Amount</label>
                    <div className="relative">
                      <Wallet size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xl font-bold tracking-tight"
                      />
                    </div>
                  </div>

                  <div id="form-group-date" className="space-y-1.5">
                    <label htmlFor="date" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Date</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div id="form-group-description" className="space-y-1.5">
                    <label htmlFor="description" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Description</label>
                    <div className="relative">
                      <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        id="description"
                        type="text"
                        required
                        placeholder="What was this for?"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    {editingId && (
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="flex-1 py-3 rounded-xl font-bold text-rose-500 hover:bg-rose-50 transition-all border border-rose-100"
                      >
                        Delete
                      </button>
                    )}
                     <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-100 transition-all"
                    >
                      {editingId ? 'Cancel' : 'Discard'}
                    </button>
                    <button
                      id="submit-btn"
                      type="submit"
                      className={`flex-[2] py-3 rounded-xl font-bold text-white transition-all active:scale-[0.98] shadow-sm ${
                        activeTab === 'expense' 
                          ? 'bg-rose-600 hover:bg-rose-700' 
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                    >
                      {editingId ? 'Update' : 'Confirm'}
                    </button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

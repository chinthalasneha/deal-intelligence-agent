import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, User, Building2, PhoneCall, Check, Sparkles } from 'lucide-react';

export default function CustomerSelector({ customers, selectedCustomer, onSelectCustomer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company_name && c.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getSentimentBadge = (sentiment) => {
    if (!sentiment) return null;
    const s = sentiment.toLowerCase();
    if (s.includes('positive') || s.includes('ready') || s.includes('won') || s.includes('enthusiastic')) {
      return <span className="w-2 h-2 rounded-full bg-emerald-400 glow-green"></span>;
    }
    if (s.includes('neutral') || s.includes('warming')) {
      return <span className="w-2 h-2 rounded-full bg-amber-400 glow-yellow"></span>;
    }
    return <span className="w-2 h-2 rounded-full bg-rose-500 glow-red"></span>;
  };

  return (
    <div className="relative w-full max-w-xl mx-auto z-30" ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-purple-400" />
          Select Target Customer
        </span>
        <span className="text-[11px] text-slate-500 font-normal">
          {customers.length} Accounts Loaded
        </span>
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left px-4 py-3.5 rounded-2xl glass-card transition-all duration-300 flex items-center justify-between border ${
          isOpen
            ? 'border-purple-500/70 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/20'
            : 'border-[#2e2820] hover:border-purple-500/40 hover:bg-[#1f1a15]'
        }`}
      >
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-purple-300" />
          </div>
          {selectedCustomer ? (
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base truncate">
                  {selectedCustomer.customer_name}
                </span>
                {getSentimentBadge(selectedCustomer.latest_sentiment)}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                <span>{selectedCustomer.company_name}</span>
                <span className="text-slate-600">•</span>
                <span className="text-purple-300 font-medium flex items-center gap-1">
                  <PhoneCall className="w-3 h-3" />
                  {selectedCustomer.total_calls} Calls
                </span>
              </p>
            </div>
          ) : (
            <span className="text-slate-400 font-medium">Select a customer...</span>
          )}
        </div>

        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
            isOpen ? 'rotate-180 text-purple-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 right-0 top-full mt-2 bg-[#1a1612] border border-[#2e2820] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
          >
            {/* Search Bar */}
            <div className="p-3 border-b border-[#2e2820]/80 bg-[#14110d]/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer or company name..."
                  className="w-full bg-[#14110d] border border-[#2e2820] text-sm text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-64 overflow-y-auto p-2 space-y-1">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => {
                  const isSelected = selectedCustomer?.customer_name === cust.customer_name;
                  return (
                    <button
                      key={cust.customer_name}
                      type="button"
                      onClick={() => {
                        onSelectCustomer(cust);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-purple-500/40 text-white'
                          : 'hover:bg-[#241f1a] text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                            isSelected
                              ? 'bg-gradient-to-tr from-[#6366f1] to-[#a855f7] text-white shadow-md'
                              : 'bg-[#262019] text-purple-300 group-hover:bg-[#2e2820]'
                          }`}
                        >
                          {cust.customer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{cust.customer_name}</span>
                            {getSentimentBadge(cust.latest_sentiment)}
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{cust.company_name}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400">{cust.total_calls} calls</span>
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No customers matching "{searchQuery}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

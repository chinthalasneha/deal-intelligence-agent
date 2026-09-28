import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, User, Building2, PhoneCall, Check } from 'lucide-react';
import './CustomerSelector.css';

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
      return <span className="w-2 h-2 rounded-full bg-[var(--status-success)] glow-green"></span>;
    }
    if (s.includes('neutral') || s.includes('warming')) {
      return <span className="w-2 h-2 rounded-full bg-[var(--status-warning)] glow-yellow"></span>;
    }
    return <span className="w-2 h-2 rounded-full bg-[var(--status-danger)] glow-red"></span>;
  };

  return (
    <div className="customer-selector-container" ref={dropdownRef}>
      {/* Top Header Label */}
      <label className="customer-selector-label">
        <span className="customer-selector-label-left">
          <User className="customer-selector-label-icon" />
          Select Target Customer
        </span>
        <span className="customer-selector-count">
          {customers.length} Accounts Loaded
        </span>
      </label>

      {/* Trigger Button ("Down Part") */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`customer-selector-trigger ${isOpen ? 'is-open' : ''}`}
      >
        <div className="customer-selector-trigger-left">
          <div className="customer-selector-avatar">
            <Building2 className="customer-selector-avatar-icon" />
          </div>
          {selectedCustomer ? (
            <div className="customer-selector-info">
              <div className="customer-selector-name-row">
                <span className="customer-selector-name">
                  {selectedCustomer.customer_name}
                </span>
                {getSentimentBadge(selectedCustomer.latest_sentiment)}
              </div>
              <p className="customer-selector-meta">
                <span className="customer-selector-meta-company">{selectedCustomer.company_name}</span>
                <span className="customer-selector-meta-dot">•</span>
                <span className="customer-selector-meta-calls">
                  <PhoneCall className="customer-selector-meta-calls-icon" />
                  {selectedCustomer.total_calls} Calls
                </span>
              </p>
            </div>
          ) : (
            <span className="customer-selector-placeholder">Select a customer...</span>
          )}
        </div>

        <ChevronDown
          className={`customer-selector-chevron ${isOpen ? 'rotated' : ''}`}
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
            className="customer-selector-dropdown"
          >
            {/* Search Bar */}
            <div className="customer-selector-search">
              <div className="customer-selector-search-inner">
                <Search className="customer-selector-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer or company name..."
                  className="customer-selector-search-input"
                  autoFocus
                />
              </div>
            </div>

            {/* List */}
            <div className="customer-selector-list">
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
                      className={`customer-selector-item ${isSelected ? 'is-selected' : ''}`}
                    >
                      <div className="customer-selector-item-left">
                        <div
                          className={`customer-selector-item-badge ${
                            isSelected ? 'selected' : 'unselected'
                          }`}
                        >
                          {cust.customer_name.charAt(0)}
                        </div>
                        <div>
                          <div className="customer-selector-item-title-row">
                            <span className="customer-selector-item-title">{cust.customer_name}</span>
                            {getSentimentBadge(cust.latest_sentiment)}
                          </div>
                          <p className="customer-selector-item-meta">
                            <span>{cust.company_name}</span>
                            <span>•</span>
                            <span>{cust.total_calls} calls</span>
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="customer-selector-check-icon">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="customer-selector-empty">
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

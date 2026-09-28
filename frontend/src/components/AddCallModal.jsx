import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PlusCircle, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function AddCallModal({ isOpen, onClose, selectedCustomer, nextCallNumber, onCallSaved }) {
  const [formData, setFormData] = useState({
    objection_raised: '',
    competitor_mentioned: '',
    sentiment: 'positive',
    key_quote: '',
    next_step_promised: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        objection_raised: '',
        competitor_mentioned: '',
        sentiment: 'positive',
        key_quote: '',
        next_step_promised: ''
      });
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen || !selectedCustomer) return null;

  const targetCustomerName = selectedCustomer.customer_name;
  const targetCompanyName = selectedCustomer.company_name;
  const targetCallNumber = nextCallNumber || (selectedCustomer.total_calls || 4) + 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    const payload = {
      customer_name: targetCustomerName,
      company_name: targetCompanyName,
      call_number: targetCallNumber,
      date: new Date().toISOString().split('T')[0],
      objection_raised: formData.objection_raised || 'None',
      competitor_mentioned: formData.competitor_mentioned.trim() ? formData.competitor_mentioned.trim() : null,
      sentiment: formData.sentiment,
      deal_stage: formData.sentiment.includes('positive') ? 'closed won' : 'negotiation',
      key_quote: formData.key_quote || 'Looking forward to our next steps.',
      next_step_promised: formData.next_step_promised || 'Follow up call scheduled'
    };

    try {
      const response = await fetch('/api/save-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to save call');
      }

      const result = await response.json();
      onCallSaved(targetCustomerName, targetCallNumber, result.call || payload);
      onClose();
    } catch (err) {
      console.error('Save call error:', err);
      setErrorMessage(err.message || 'Error saving call record to backend');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-[#1a1612] border border-[#2e2820] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Top Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7]" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2e2820]">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  New Call #{targetCallNumber}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {targetCompanyName}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-purple-400" />
                Log Call #{targetCallNumber} for {targetCustomerName}
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#241f1a] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            {/* Objection Raised */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Objection Raised <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., price too high, needs manager sign off, none"
                value={formData.objection_raised}
                onChange={(e) => setFormData({ ...formData, objection_raised: e.target.value })}
                className="w-full bg-[#14110d] border border-[#2e2820] text-sm text-slate-200 rounded-xl px-3.5 py-2.5 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40 focus:outline-none placeholder-slate-600 transition-all"
              />
            </div>

            {/* Competitor Mentioned & Sentiment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Competitor Mentioned <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., FabricFlow, RouteMaster"
                  value={formData.competitor_mentioned}
                  onChange={(e) => setFormData({ ...formData, competitor_mentioned: e.target.value })}
                  className="w-full bg-[#14110d] border border-[#2e2820] text-sm text-slate-200 rounded-xl px-3.5 py-2.5 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40 focus:outline-none placeholder-slate-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Sentiment <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.sentiment}
                  onChange={(e) => setFormData({ ...formData, sentiment: e.target.value })}
                  className="w-full bg-[#14110d] border border-[#2e2820] text-sm text-slate-200 rounded-xl px-3.5 py-2.5 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40 focus:outline-none cursor-pointer transition-all"
                >
                  <option value="hesitant">Hesitant (Red)</option>
                  <option value="neutral">Neutral (Yellow)</option>
                  <option value="warming up">Warming Up (Yellow)</option>
                  <option value="positive">Positive / Ready to Close (Green)</option>
                </select>
              </div>
            </div>

            {/* Key Quote */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Key Customer Quote <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows="2"
                required
                placeholder='e.g., "My manager loved the summary deck and gave full sign-off!"'
                value={formData.key_quote}
                onChange={(e) => setFormData({ ...formData, key_quote: e.target.value })}
                className="w-full bg-[#14110d] border border-[#2e2820] text-sm text-slate-200 rounded-xl px-3.5 py-2.5 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40 focus:outline-none placeholder-slate-600 transition-all resize-none"
              />
            </div>

            {/* Next Step Promised */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Next Step Promised <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Send final contract and schedule onboarding"
                value={formData.next_step_promised}
                onChange={(e) => setFormData({ ...formData, next_step_promised: e.target.value })}
                className="w-full bg-[#14110d] border border-[#2e2820] text-sm text-slate-200 rounded-xl px-3.5 py-2.5 focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40 focus:outline-none placeholder-slate-600 transition-all"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#241f1a] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] text-xs font-bold text-white shadow-lg shadow-purple-500/30 hover:opacity-95 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Saving & Generating Brief...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Call #{targetCallNumber}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

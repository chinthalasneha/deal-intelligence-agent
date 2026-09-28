import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Swords, 
  Smile, 
  Lightbulb, 
  Quote, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  Calendar, 
  Flag,
  ArrowRight
} from 'lucide-react';

export default function BriefCard({ briefData, selectedCallNumber }) {
  const [copied, setCopied] = useState(false);

  if (!briefData) return null;

  const { customer_name, brief, history, current_call } = briefData;

  // Derive latest call metadata up to selectedCallNumber
  const activeCallRecord = current_call || (history && history.length > 0 ? history[history.length - 1] : null);
  const companyName = activeCallRecord?.company_name || 'Zenith Textiles';
  const callDate = activeCallRecord?.date || '2026-08-10';
  const dealStage = activeCallRecord?.deal_stage || 'Negotiation';
  const sentiment = activeCallRecord?.sentiment || 'Neutral';
  const competitor = activeCallRecord?.competitor_mentioned || null;
  const objection = activeCallRecord?.objection_raised || 'Price / Manager Approval';
  const keyQuote = activeCallRecord?.key_quote || null;
  const nextStep = activeCallRecord?.next_step_promised || null;

  // Sentiment badge builder
  const renderSentimentBadge = (s) => {
    if (!s) return null;
    const lower = s.toLowerCase();
    
    if (lower.includes('positive') || lower.includes('ready') || lower.includes('won') || lower.includes('enthusiastic')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 glow-green"></span>
          Positive / Ready to Close ({s})
        </span>
      );
    }
    if (lower.includes('neutral') || lower.includes('warming')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10">
          <span className="w-2 h-2 rounded-full bg-amber-400 glow-yellow"></span>
          Neutral / Warming Up ({s})
        </span>
      );
    }
    // Hesitant / Cautious
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm shadow-rose-500/10">
        <span className="w-2 h-2 rounded-full bg-rose-500 glow-red"></span>
        Hesitant / Cautious ({s})
      </span>
    );
  };

  const handleCopyBrief = () => {
    navigator.clipboard.writeText(brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      key={`brief-call-${selectedCallNumber}-${customer_name}`}
      initial={{ opacity: 0, y: 25, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full max-w-4xl mx-auto my-6"
    >
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-[#2e2820] shadow-2xl relative overflow-hidden">
        {/* Glowing Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7]" />

        {/* Card Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-[#2e2820]/80 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-purple-300 border border-purple-500/30">
                Call #{selectedCallNumber} Briefing
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {callDate}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 flex items-center gap-2">
              {customer_name}
            </h2>
            <p className="text-sm text-slate-400 flex items-center gap-2 mt-1">
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>{companyName}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Flag className="w-3.5 h-3.5 text-indigo-400" />
                Stage: <strong className="text-white capitalize">{dealStage}</strong>
              </span>
            </p>
          </div>

          {/* Quick Copy Button */}
          <button
            type="button"
            onClick={handleCopyBrief}
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-[#241f1a] hover:bg-[#2e2820] text-xs font-semibold text-slate-200 border border-[#3d342a] transition-all flex items-center gap-2 shadow-md hover:border-purple-500/50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-400">Brief Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-purple-400" />
                <span>Copy Full Brief</span>
              </>
            )}
          </button>
        </div>

        {/* Structured Highlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Biggest Objection Card */}
          <div className="p-4 rounded-2xl bg-[#14110d]/90 border border-rose-500/30 shadow-inner flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4" />
                Biggest Objection
              </div>
              <p className="text-sm font-semibold text-slate-200 capitalize">
                {objection || "None identified"}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-rose-500/10 text-[11px] text-slate-400">
              Primary sales hurdle raised
            </div>
          </div>

          {/* Competitor Mentioned Card */}
          <div className="p-4 rounded-2xl bg-[#14110d]/90 border border-purple-500/30 shadow-inner flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Swords className="w-4 h-4" />
                Competitor Mentioned
              </div>
              {competitor ? (
                <span className="inline-block px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-sm border border-purple-500/30">
                  {competitor}
                </span>
              ) : (
                <span className="text-sm text-slate-400 font-medium italic">
                  No competitor cited
                </span>
              )}
            </div>
            <div className="mt-3 pt-2 border-t border-purple-500/10 text-[11px] text-slate-400">
              {competitor ? 'Active market rival' : 'Sole option under review'}
            </div>
          </div>

          {/* Current Sentiment Card */}
          <div className="p-4 rounded-2xl bg-[#14110d]/90 border border-slate-700/50 shadow-inner flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Smile className="w-4 h-4" />
                Current Sentiment
              </div>
              <div>{renderSentimentBadge(sentiment)}</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Buyer mood on Call #{selectedCallNumber}
            </div>
          </div>
        </div>

        {/* AI Brief Content (Formatted Markdown) */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-purple-300 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Pre-Call Executive Briefing
          </div>
          <div className="p-6 rounded-2xl bg-[#14110d] border border-[#2e2820] text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {brief}
          </div>
        </div>

        {/* Quote & Next Step Promised Footer */}
        {keyQuote && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-transparent border border-indigo-500/20 flex items-start gap-3">
            <Quote className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">
                Key Customer Quote (Call #{selectedCallNumber})
              </p>
              <p className="text-sm text-slate-200 italic mt-0.5 font-serif">
                "{keyQuote}"
              </p>
              {nextStep && (
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 font-sans">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400" />
                  Next Step Promised: <span className="text-purple-300 font-medium">{nextStep}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

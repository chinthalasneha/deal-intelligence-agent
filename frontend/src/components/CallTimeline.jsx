import React from 'react';
import { motion } from 'framer-motion';
import { Check, Calendar, Flag, Sparkles } from 'lucide-react';

export default function CallTimeline({ calls, selectedCallNumber, onSelectCall }) {
  if (!calls || calls.length === 0) return null;

  // Helper to determine sentiment color for timeline circle
  const getSentimentStyle = (sentiment) => {
    if (!sentiment) {
      return {
        bg: 'bg-slate-700',
        border: 'border-slate-600',
        text: 'text-slate-300',
        glow: '',
        colorName: 'Neutral'
      };
    }
    const s = sentiment.toLowerCase();
    if (s.includes('positive') || s.includes('ready') || s.includes('won') || s.includes('enthusiastic')) {
      return {
        bg: 'bg-emerald-500',
        border: 'border-emerald-400',
        text: 'text-emerald-300',
        glow: 'shadow-lg shadow-emerald-500/40 glow-green',
        colorName: 'Positive'
      };
    }
    if (s.includes('neutral') || s.includes('warming')) {
      return {
        bg: 'bg-amber-500',
        border: 'border-amber-400',
        text: 'text-amber-300',
        glow: 'shadow-lg shadow-amber-500/40 glow-yellow',
        colorName: 'Neutral / Warming'
      };
    }
    // Hesitant / Cautious / Skeptical
    return {
      bg: 'bg-rose-500',
      border: 'border-rose-400',
      text: 'text-rose-300',
      glow: 'shadow-lg shadow-rose-500/40 glow-red',
      colorName: 'Hesitant'
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Sales Call Memory Timeline
          </h3>
        </div>
        
        {/* Sentiment Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            Hesitant
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            Warming Up
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Positive / Closed
          </span>
        </div>
      </div>

      {/* Stepper Container */}
      <div className="relative glass-card rounded-2xl p-6 sm:p-8 border border-[#2e2820] shadow-xl">
        {/* Progress Connecting Line */}
        <div className="absolute top-1/2 left-12 right-12 -translate-y-1/2 h-1 bg-[#262019] z-0 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500"
            initial={{ width: '0%' }}
            animate={{
              width: `${((selectedCallNumber - 1) / (calls.length - 1 || 1)) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {/* Stepper Nodes */}
        <div className="relative z-10 flex items-center justify-between">
          {calls.map((call) => {
            const isSelected = call.call_number === selectedCallNumber;
            const isCompleted = call.call_number < selectedCallNumber;
            const sentimentStyle = getSentimentStyle(call.sentiment);

            return (
              <div key={call.call_number} className="flex flex-col items-center group relative">
                {/* Node Button */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelectCall(call.call_number)}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-extrabold text-sm sm:text-base transition-all duration-300 ${
                    isSelected
                      ? `bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#a855f7] text-white ring-4 ring-purple-500/30 scale-110 shadow-xl shadow-purple-500/40 glow-accent animate-pulse-glow`
                      : isCompleted
                      ? `${sentimentStyle.bg} text-white shadow-md ${sentimentStyle.glow}`
                      : `${sentimentStyle.bg} opacity-80 text-white hover:opacity-100`
                  }`}
                >
                  {/* Outer Sentiment Ring Indicator */}
                  <span
                    className={`absolute -inset-1.5 rounded-full border-2 ${
                      isSelected
                        ? 'border-purple-400/80 animate-ping'
                        : sentimentStyle.border
                    } pointer-events-none opacity-60`}
                  />

                  {/* Icon or Number */}
                  {isCompleted ? (
                    <Check className="w-6 h-6 stroke-[3]" />
                  ) : (
                    <span>{call.call_number}</span>
                  )}
                </motion.button>

                {/* Call Label */}
                <div className="mt-3 text-center">
                  <span
                    className={`block text-xs font-bold transition-colors ${
                      isSelected
                        ? 'text-purple-300 scale-105'
                        : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    Call #{call.call_number}
                  </span>
                  
                  {/* Dynamic Sentiment Color Badge Label */}
                  <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase tracking-wider ${sentimentStyle.text} bg-black/40 border border-white/5`}>
                    {call.sentiment || 'Call Record'}
                  </span>
                </div>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full mb-3 hidden group-hover:flex flex-col items-center z-30 pointer-events-none transition-all duration-200">
                  <div className="bg-[#14110d] text-slate-200 text-xs rounded-xl p-3 shadow-2xl border border-[#2e2820] w-48 text-left">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{call.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300 mb-1">
                      <Flag className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="capitalize">{call.deal_stage}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic line-clamp-2">
                      "{call.key_quote}"
                    </p>
                  </div>
                  <div className="w-2.5 h-2.5 bg-[#14110d] rotate-45 -mt-1.5 border-r border-b border-[#2e2820]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

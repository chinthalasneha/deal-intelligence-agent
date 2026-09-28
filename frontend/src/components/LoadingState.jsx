import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles } from 'lucide-react';

export default function LoadingState({ message = "Recalling memory..." }) {
  return (
    <div className="w-full max-w-4xl mx-auto my-12 p-12 glass-card rounded-3xl border border-[#2e2820] flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
      {/* Background Animated Glow Orb */}
      <div className="absolute w-64 h-64 bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse pointer-events-none" />

      {/* Pulsing Brain Icon with Spinning Orbit */}
      <div className="relative mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute -inset-4 rounded-full border-2 border-dashed border-purple-500/40"
        />

        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#a855f7] p-0.5 shadow-xl shadow-purple-500/30 flex items-center justify-center"
        >
          <div className="w-full h-full bg-[#14110d] rounded-[14px] flex items-center justify-center">
            <BrainCircuit className="w-10 h-10 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Message */}
      <h4 className="text-xl font-bold text-white flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
        {message}
      </h4>
      <p className="text-sm text-slate-400 mt-1 max-w-sm">
        Analyzing call history transcripts, past objections, sentiment shifts, and competitor insights via Groq LLM...
      </p>

      {/* Animated Dots */}
      <div className="flex items-center gap-2 mt-5">
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
          className="w-2.5 h-2.5 rounded-full bg-indigo-500"
        />
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          className="w-2.5 h-2.5 rounded-full bg-purple-500"
        />
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
          className="w-2.5 h-2.5 rounded-full bg-pink-500"
        />
      </div>
    </div>
  );
}

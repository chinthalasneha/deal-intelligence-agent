import React from 'react';
import { Sparkles, BrainCircuit, Activity } from 'lucide-react';

export default function Header({ isBackendConnected }) {
  return (
    <header className="border-b border-[#2e2820]/60 bg-[#14110d]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6366f1] via-[#8b5cf6] to-[#a855f7] p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#14110d] rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-purple-300">
                DealSense AI
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Your AI Sales Memory Assistant
            </p>
          </div>
        </div>

        {/* Right Status / Badge */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1612] border border-[#2e2820] text-xs font-medium text-slate-300">
            <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Groq <code className="text-purple-300 font-mono">gpt-oss-120b</code></span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            isBackendConnected 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            {isBackendConnected ? 'Backend Live' : 'Connecting...'}
          </div>
        </div>
      </div>
    </header>
  );
}

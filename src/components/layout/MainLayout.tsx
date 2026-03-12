import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Layout, Code, Gauge, Cpu, Zap, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTab, setActiveTab, isRunning, setRunning } = useStore();

  const tabs = [
    { id: 'circuit', label: 'Circuit Builder', icon: Cpu },
    { id: 'code', label: 'Code Editor', icon: Code },
    { id: 'dashboard', label: 'IoT Dashboard', icon: Gauge },
  ] as const;

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#1e1e1e] border-b border-white/10 shadow-lg z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">KEP Simulator</h1>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono">3D IoT Simulation Engine</p>
          </div>
        </div>

        <nav className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                activeTab === tab.id 
                  ? "bg-white/10 text-white shadow-inner" 
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setRunning(!isRunning)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all duration-300 shadow-lg",
              isRunning 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20" 
                : "bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/20"
            )}
          >
            {isRunning ? (
              <>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Stop Simulation
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                Run Simulation
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-[#1a1a1a] border-top border-white/5 px-4 flex items-center justify-between text-[10px] font-mono text-white/30">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <div className={cn("w-1.5 h-1.5 rounded-full", isRunning ? "bg-emerald-500 animate-pulse" : "bg-white/20")} />
            ENGINE: {isRunning ? "ACTIVE" : "IDLE"}
          </span>
          <span>FPS: 60</span>
          <span>LATENCY: 12ms</span>
        </div>
        <div className="flex gap-4">
          <span>V1.0.4-STABLE</span>
          <span className="text-emerald-500/50">SYSTEMS NOMINAL</span>
        </div>
      </footer>
    </div>
  );
};

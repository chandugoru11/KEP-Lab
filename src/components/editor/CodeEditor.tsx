import React from 'react';
import { useStore } from '../../store/useStore';
import { Play, Save, RotateCcw, Terminal } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const { code, setCode, isRunning, setRunning } = useStore();

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e]">
      {/* Editor Toolbar */}
      <div className="h-12 bg-[#252525] border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-md border border-white/5">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Target:</span>
            <span className="text-xs font-mono text-emerald-500">Arduino Uno</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-white/40 hover:text-white transition-colors">
            <Save className="w-4 h-4" />
          </button>
          <button className="p-2 text-white/40 hover:text-white transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-2" />
          <button 
            onClick={() => setRunning(!isRunning)}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-black rounded-lg font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            COMPILE & RUN
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-12 bg-[#1a1a1a] border-r border-white/5 flex flex-col items-center py-4 text-[10px] font-mono text-white/20 select-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="h-[1.5rem] flex items-center">{i + 1}</div>
          ))}
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 bg-[#1e1e1e] p-4 font-mono text-sm text-white/80 outline-none resize-none leading-[1.5rem]"
          spellCheck={false}
        />
      </div>

      {/* Console */}
      <div className="h-48 bg-[#0d0d0d] border-t border-white/10 flex flex-col">
        <div className="h-8 px-4 flex items-center gap-2 border-b border-white/5 bg-white/5">
          <Terminal className="w-3 h-3 text-white/40" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Output Console</span>
        </div>
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
          <div className="text-emerald-500/60">[SYSTEM] Initializing compiler...</div>
          <div className="text-emerald-500/60">[SYSTEM] Ready.</div>
          {isRunning && (
            <>
              <div className="text-white/80 mt-2">Compiling sketch...</div>
              <div className="text-white/80">Linking libraries...</div>
              <div className="text-emerald-400 font-bold">Compilation successful. Memory usage: 12%</div>
              <div className="text-white/80">Uploading to virtual board...</div>
              <div className="text-emerald-400 font-bold">Simulation started.</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

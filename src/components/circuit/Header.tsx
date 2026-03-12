import React from 'react';
import { Share2, Settings, User, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 right-0 h-10 bg-[#ffffff] border-b border-gray-300 flex items-center justify-between px-4 z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
            <span className="text-white font-black text-[10px]">TC</span>
          </div>
          <h1 className="text-xs font-bold text-gray-700">Circuit Designer IDE</h1>
        </div>
        <div className="h-4 w-px bg-gray-300" />
        <span className="text-[10px] text-gray-500 font-medium">Editing Components</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
          <User className="w-3 h-3 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Menu } from 'lucide-react';

const MobileHeader = ({ setSidebarOpen, title = "Dashboard" }) => {
  return (
    <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Menu size={24} className="text-slate-600 dark:text-slate-400" />
      </button>
      <h1 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h1>
      <div className="w-10" /> {/* Spacer for centering */}
    </div>
  );
};

export default MobileHeader;

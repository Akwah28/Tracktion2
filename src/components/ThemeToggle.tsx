import React, { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { mode: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { mode: 'system', label: 'System', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const selectMode = (mode: ThemeMode) => {
    setTheme(mode);
    setIsOpen(false);
  };

  const activeOption = options.find((opt) => opt.mode === theme) || options[2];

  return (
    <div className={`relative ${className}`}>
      {/* Active Toggle Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center justify-center h-9 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:scale-105 duration-200 transition-all shadow-xs cursor-pointer select-none"
        title="Toggle Theme Mode"
      >
        <div className="flex items-center gap-1.5 px-1">
          {resolvedTheme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500 fill-amber-100/50 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400 fill-indigo-950/20" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
            {activeOption.label}
          </span>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop layer to click away */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          <div className="absolute right-0 mt-1.5 w-32 rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md p-1.5 shadow-xl dark:shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((opt) => {
              const isSelected = theme === opt.mode;
              return (
                <button
                  key={opt.mode}
                  onClick={() => selectMode(opt.mode)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[10.5px] font-extrabold uppercase tracking-wide cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-900 text-indigo-650 dark:text-indigo-400'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/55 hover:text-slate-805 dark:hover:text-slate-200'
                  }`}
                >
                  <span className={isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}>
                    {opt.icon}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

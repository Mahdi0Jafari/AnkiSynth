'use client';

import React, { useEffect, useState } from 'react';
import { X, Command } from 'lucide-react';

export default function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  // Hydration sync for smooth entrance animation
  useEffect(() => {
    setMounted(true);
  }, []);

  const shortcutList = [
    { keys: ['⌘', 'Enter'], label: 'Execute AI Forge' },
    { keys: ['⌘', 'S'], label: 'Save Deck to Library' },
    { keys: ['?'], label: 'Toggle Shortcuts Menu' },
    { keys: ['F'], label: 'Switch to Forge View' },
    { keys: ['L'], label: 'Switch to Library View' },
  ];

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-opacity duration-300"
    >
      <div 
        onClick={e => e.stopPropagation()} 
        className={`w-full max-w-md bg-surface-container-high border border-white/10 rounded-3xl p-8 shadow-2xl transform transition-all duration-300 ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Command className="text-primary" size={20} />
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90">System Protocols</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/20 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {shortcutList.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
            >
              <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
              <div className="flex gap-1.5">
                {item.keys.map(key => (
                  <kbd 
                    key={key} 
                    className="px-2 py-1 bg-black/50 border border-white/10 rounded-md text-[10px] font-mono text-primary font-bold min-w-[28px] text-center shadow-inner"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
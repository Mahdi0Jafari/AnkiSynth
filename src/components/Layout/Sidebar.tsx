'use client';

import React, { useState } from 'react';
import { Zap, Bolt, FolderOpen, Settings, Keyboard, X } from 'lucide-react';
import SettingsModal from '../Settings/SettingsModal';
import { ViewState } from '@/app/page';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ViewState;
  setActiveView: (view: ViewState) => void;
  onOpenShortcuts: () => void;
}

export default function Sidebar({ isOpen, onClose, activeView, setActiveView, onOpenShortcuts }: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Generates consistent navigation item styling
  const getNavItemClass = (isActive: boolean) => 
    `group relative flex items-center md:justify-center w-full md:w-10 h-12 md:h-10 rounded-xl transition-all duration-300 px-6 md:px-0 ${isActive ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-white/5 hover:text-white'}`;

  const handleNav = (view: ViewState) => {
    setActiveView(view);
    onClose(); // Auto-close drawer on mobile devices
  };

  return (
    <>
      {/* Mobile Interaction Backdrop */}
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" />
      )}

      {/* Main Sidebar Core */}
      <aside className={`fixed left-0 top-0 h-screen bg-[#0e0e10] border-r border-white/5 flex flex-col items-center py-6 z-50 transition-transform duration-300 ease-in-out w-64 md:w-14 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        <div className="flex items-center justify-between w-full px-6 md:px-0 md:justify-center mb-10">
          <div className="text-primary drop-shadow-[0_0_10px_rgba(251,81,251,0.5)]">
            <Zap size={24} fill="currentColor" className="animate-pulse" />
          </div>
          <button onClick={onClose} className="md:hidden text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-4 w-full md:items-center">
          <button onClick={() => handleNav('forge')} className={getNavItemClass(activeView === 'forge')} title="Synthesis Forge">
            <Bolt size={20} className="shrink-0" />
            <span className="md:hidden ml-4 text-[11px] font-bold uppercase tracking-widest">Synthesis Forge</span>
            <div className="absolute left-14 hidden md:group-hover:block bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap uppercase tracking-widest shadow-xl">Forge</div>
          </button>

          <button onClick={() => handleNav('library')} className={getNavItemClass(activeView === 'library')} title="Knowledge Library">
            <FolderOpen size={20} className="shrink-0" />
            <span className="md:hidden ml-4 text-[11px] font-bold uppercase tracking-widest">Knowledge Library</span>
            <div className="absolute left-14 hidden md:group-hover:block bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap uppercase tracking-widest shadow-xl">Library</div>
          </button>
        </nav>

        <div className="flex flex-col gap-4 mb-2 w-full md:items-center">
          <button 
            onClick={() => { onOpenShortcuts(); onClose(); }}
            className={`${getNavItemClass(false)} hidden md:flex`} 
            title="Keyboard Shortcuts ( ? )"
          >
            <Keyboard size={20} />
            <div className="absolute left-14 hidden md:group-hover:block bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap uppercase tracking-widest shadow-xl">Shortcuts</div>
          </button>

          <button 
            onClick={() => { setIsSettingsOpen(true); onClose(); }} 
            className={`${getNavItemClass(false)} hover:rotate-45`} 
            title="System Parameters"
          >
            <Settings size={20} className="shrink-0" />
            <span className="md:hidden ml-4 text-[11px] font-bold uppercase tracking-widest">Settings</span>
            <div className="absolute left-14 hidden md:group-hover:block bg-surface-container-high text-on-surface text-[10px] px-2 py-1 rounded border border-white/10 whitespace-nowrap uppercase tracking-widest shadow-xl">Settings</div>
          </button>
        </div>
      </aside>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </>
  );
}
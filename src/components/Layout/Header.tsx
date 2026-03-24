'use client';
import React from 'react';
import { Zap, Menu } from 'lucide-react';
import { useSettings } from '@/store/useSettings';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { apiKey } = useSettings();

  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 md:px-10 bg-surface shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-white/40 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
        <div className="hidden md:block">
            <Zap className="text-primary" size={20} fill="currentColor" />
        </div>
        <h1 className="font-headline text-lg font-bold tracking-tight text-white/90">AnkiSynth</h1>
      </div>
      
      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
          <div className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-secondary' : 'bg-tertiary'} animate-pulse`} />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
            {apiKey ? 'AI-Engine-Live' : 'Manual-Only'}
          </span>
        </div>
      </div>
    </header>
  );
}
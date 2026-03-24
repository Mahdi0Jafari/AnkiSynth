'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Sidebar from '@/components/Layout/Sidebar';
import LibraryView from '@/components/Library/LibraryView';
import ShortcutsModal from '@/components/Settings/ShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// Lazy load heavy client-side modules to bypass SSR collisions
const SourcePanel = dynamic(() => import('@/components/Forge/SourcePanel'), { 
  ssr: false, loading: () => <div className="p-10 opacity-20 animate-pulse font-mono text-[10px] uppercase">Loading Ingestion Core...</div>
});

const Workbench = dynamic(() => import('@/components/Forge/Workbench'), { 
  ssr: false, loading: () => <div className="p-10 opacity-20 animate-pulse font-mono text-[10px] uppercase">Loading Workbench...</div>
});

export type ViewState = 'forge' | 'library';

export default function AnkiSynthPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('forge');
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global Navigation Shortcuts Registration
  useKeyboardShortcuts({
    viewForge: () => setActiveView('forge'),
    viewLibrary: () => setActiveView('library'),
    toggleShortcuts: () => setIsShortcutsOpen(prev => !prev)
  });

  return (
    <div className="flex h-screen bg-surface text-on-surface overflow-hidden antialiased">
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden md:ml-14 transition-all duration-300 relative">
        <Header onMenuClick={() => setIsMenuOpen(true)} />
        
        {activeView === 'forge' ? (
          <div className="flex flex-1 flex-col md:flex-row overflow-hidden border-t border-white/5 animate-in fade-in duration-500">
            <section className="w-full md:w-[45%] h-1/2 md:h-full border-b md:border-b-0 md:border-r border-white/5 bg-surface overflow-y-auto custom-scrollbar">
              <SourcePanel />
            </section>
            <section className="w-full md:w-[55%] h-1/2 md:h-full bg-surface-container-low overflow-y-auto custom-scrollbar">
              <Workbench />
            </section>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 animate-in fade-in duration-500">
             <LibraryView setActiveView={setActiveView} />
          </div>
        )}

        <Footer />
        
        {/* Render global shortcuts modal at the root level */}
        {isShortcutsOpen && <ShortcutsModal onClose={() => setIsShortcutsOpen(false)} />}
      </main>
    </div>
  );
}
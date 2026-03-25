'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAnkiDB } from '@/hooks/useAnkiDB';
import { useNavigationStore } from '@/store/useNavigationStore';
import Flashcard from './Flashcard';
import { CheckCircle2, Trash2, Download, Table2, Edit3, Archive, ChevronDown, PackageOpen, PlusCircle, Loader2 } from 'lucide-react';
import { AnkiCard, db } from '@/lib/db';

export default function Workbench() {
  const { activeDeckId, setActiveDeckId } = useNavigationStore();
  const { cards, updateCard, deleteCard, toggleCardApproval, approveAll, clearWorkspace, saveToLibrary, isLoading } = useAnkiDB();
  
  const [deckName, setDeckName] = useState('AnkiSynth_Deck');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // اضافه کردن وضعیت لودینگ برای اکسپورت
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const approvedCards = cards.filter(c => c.status === 'approved');

  useEffect(() => {
    if (activeDeckId) {
      db.decks.get(activeDeckId).then(deck => {
        if (deck) setDeckName(deck.name);
      });
    } else {
      setDeckName('AnkiSynth_Deck');
    }
  }, [activeDeckId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewDeck = async () => {
    if (cards.length > 0) {
      if (!window.confirm("Start a new deck? Unsaved drafted cards will be permanently lost.")) return;
    }
    await clearWorkspace();
    setDeckName('AnkiSynth_Deck');
  };

  const handleSaveToLibrary = async () => {
    if (approvedCards.length === 0) return alert("Validation Failed: Please approve cards before saving.");
    const targetId = await saveToLibrary(deckName, approvedCards, activeDeckId);
    alert(activeDeckId ? `Deck [${deckName}] successfully updated.` : `New Deck [${deckName}] archived to Library.`);
  };

  const handleAPKGExport = async () => {
    if (approvedCards.length === 0) return alert("Validation Failed: No approved cards to export.");
    
    setIsExporting(true);
    setIsExportMenuOpen(false);
    
    try {
      // Lazy load the heavy APKG generation logic only when needed
      const { exportToAPKG } = await import('@/lib/anki-gen');
      await exportToAPKG(approvedCards, deckName);
    } catch (error) {
      console.error("Dynamic import of APKG exporter failed:", error);
      alert("Failed to load export module. Please check your connection.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCSVExport = () => {
    if (approvedCards.length === 0) return alert("Validation Failed: No approved cards to export.");
    let csvContent = "data:text/csv;charset=utf-8,Front,Back,Tags\n";
    approvedCards.forEach(card => {
      const cleanFront = card.front.replace(/"/g, '""');
      const cleanBack = card.back.replace(/"/g, '""');
      csvContent += `"${cleanFront}","${cleanBack}","${card.tags.join(' ')}"\n`;
    });
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `${deckName}_${new Date().getTime()}.csv`;
    link.click();
    setIsExportMenuOpen(false);
  };

  if (isLoading) return <div className="p-10 text-white/10 font-mono text-[10px] animate-pulse tracking-widest uppercase">Booting Storage Subsystem...</div>;

  return (
    <div className="flex flex-col min-h-full bg-[#0e0e10]">
      <div className="sticky top-0 z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-6 md:px-10 py-6 bg-[#0e0e10]/80 backdrop-blur-2xl border-b border-white/5">
        
        <div className="flex flex-col gap-2 group min-w-0 flex-shrink-0">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] whitespace-nowrap">
            <span className={`px-2 py-0.5 rounded-sm font-bold ${activeDeckId ? "bg-tertiary/20 text-tertiary" : "bg-white/10 text-white/80"}`}>
              {activeDeckId ? 'EDIT MODE' : 'NEW DECK'}
            </span>
            <span className="text-white/50">• {approvedCards.length} Ready / {cards.length} Total</span>
          </div>
          
          <div className="flex items-center gap-2 max-w-full">
            <input 
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="bg-transparent text-xl font-headline font-bold text-white/90 outline-none w-full max-w-[200px] sm:max-w-[300px] border-b border-transparent focus:border-primary/50 transition-colors placeholder:text-white/20 truncate"
              placeholder="Enter Deck Name..."
            />
            <Edit3 size={14} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto lg:justify-end">
          <button onClick={handleNewDeck} className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white/60 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:text-white transition-all">
            <PlusCircle size={14} /> <span className="hidden sm:inline">New Deck</span>
          </button>

          <button onClick={approveAll} className="flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/5 rounded-lg border border-secondary/10 hover:bg-secondary/10 transition-all">
            <CheckCircle2 size={14} /> <span className="hidden sm:inline">Validate All</span>
          </button>

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              disabled={approvedCards.length === 0 || isExporting}
              className={`flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white/80 transition-all ${approvedCards.length === 0 || isExporting ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'}`}
            >
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
              {isExporting ? 'Exporting...' : 'Export'} 
              {!isExporting && <ChevronDown size={12} className={`transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />}
            </button>
            
            {isExportMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-high border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <button onClick={handleAPKGExport} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/80 hover:bg-white/5 transition-colors text-left border-b border-white/5">
                  <PackageOpen size={16} className="text-primary" /> Anki (.apkg)
                </button>
                <button onClick={handleCSVExport} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/80 hover:bg-white/5 transition-colors text-left">
                  <Table2 size={16} className="text-secondary" /> Excel (.csv)
                </button>
              </div>
            )}
          </div>

          <button onClick={handleSaveToLibrary} className={`flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/20 transition-all ${approvedCards.length === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100 active:scale-95'}`} title={activeDeckId ? "Update existing deck" : "Commit to Library"}>
            <Archive size={14} /> <span className="hidden sm:inline">{activeDeckId ? 'Update Deck' : 'Save Deck'}</span>
          </button>

          <button onClick={async () => {
            if(window.confirm(activeDeckId ? 'Close deck? Unsaved changes are preserved.' : 'Clear workspace? Unsaved drafts will be deleted.')) {
              await clearWorkspace();
            }
          }} className="p-2 ml-1 text-white/20 hover:text-error hover:bg-error/10 rounded-lg transition-all" title="Purge/Close Active Workspace">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="p-6 md:p-10 space-y-6 pb-24">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/5 rounded-[2rem] bg-[#131315]/30">
            <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4 opacity-20">
              <Download size={20} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/10">Awaiting Knowledge Ingestion</span>
          </div>
        ) : (
          cards.map((card: AnkiCard) => (
            <Flashcard key={card.id} card={card} onUpdate={updateCard} onDelete={deleteCard} onToggleApprove={toggleCardApproval} />
          ))
        )}
      </div>
    </div>
  );
}
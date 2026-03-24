'use client';

import React from 'react';
import { useAnkiDB } from '@/hooks/useAnkiDB';
import { Package, Trash2, Edit, UploadCloud } from 'lucide-react';
import { ViewState } from '@/app/page';

interface LibraryViewProps {
  setActiveView: (view: ViewState) => void;
}

export default function LibraryView({ setActiveView }: LibraryViewProps) {
  const { decks, loadDeckToWorkspace, deleteDeck } = useAnkiDB();

  const handleLoadDeck = async (deckId: number) => {
    await loadDeckToWorkspace(deckId); // هوک جدید مستقیماً استور را آپدیت می‌کند
    setActiveView('forge');
  };

  const handleDelete = async (deckId: number, deckName: string) => {
    if (window.confirm(`Permanently delete "${deckName}" and all associated cards?`)) {
      await deleteDeck(deckId);
    }
  };

  const handleImportAPKG = () => {
    alert("APKG direct import requires WASM SQLite compilation. Scheduled for AnkiSynth v1.1. Use Workbench for synthesis.");
  };

  return (
    <div className="max-w-5xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-2xl font-headline font-bold text-white/90 tracking-tight">Deck Library</h2>
          <p className="text-xs font-mono text-white/40 mt-2 uppercase tracking-widest">
            {decks.length} Stored Collections
          </p>
        </div>

        <button 
          onClick={handleImportAPKG}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white/80 hover:bg-white/10 transition-all active:scale-95"
        >
          <UploadCloud size={16} /> Import .APKG
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="py-32 border border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-white/20 bg-[#131315]/30">
          <Package size={32} className="mb-4 opacity-20" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Library is Empty</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {decks.map(deck => (
            <div key={deck.id} className="bg-[#131315] border border-white/5 hover:border-primary/30 rounded-2xl p-6 transition-all group flex flex-col justify-between min-h-[160px]">
              
              <div>
                <h3 className="text-lg font-bold text-white/90 truncate" title={deck.name}>
                  {deck.name}
                </h3>
                <p className="text-[10px] text-white/30 font-mono mt-2 uppercase tracking-widest">
                  {deck.cardCount} Cards • {new Date(deck.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center justify-between mt-6">
                <button 
                  onClick={() => deck.id && handleLoadDeck(deck.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Edit size={14} /> Edit Deck
                </button>

                <button 
                  onClick={() => deck.id && handleDelete(deck.id, deck.name)}
                  className="p-2 text-white/20 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                  title="Delete Deck"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
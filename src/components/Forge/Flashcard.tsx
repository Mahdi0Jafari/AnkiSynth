'use client';

import React from 'react';
import { Trash2, CheckCircle2, Type, AlertCircle, Tag } from 'lucide-react';
import { AnkiCard } from '@/lib/db';

interface FlashcardProps {
  card: AnkiCard;
  onUpdate: (id: number, updates: Partial<AnkiCard>) => void;
  onDelete: (id: number) => void;
  onToggleApprove: (id: number) => void;
}

export default function Flashcard({ card, onUpdate, onDelete, onToggleApprove }: FlashcardProps) {
  const isApproved = card.status === 'approved';

  // Highlight Cloze syntax visually in the UI without modifying the underlying raw text
  const renderFront = (text: string) => {
    return text.split(/(\{\{c1::.*?\}\})/).map((part, index) => {
      if (part.startsWith('{{c1::') && part.endsWith('}}')) {
        return <span key={index} className="text-tertiary font-mono bg-tertiary/10 px-1 rounded">{part}</span>;
      }
      return part;
    });
  };

  // Parse structured back field: [Definition] | [Tone] | [Example]
  const renderBack = (text: string) => {
    const parts = text.split('|').map(p => p.trim());
    if (parts.length >= 3) {
      return (
        <div className="flex flex-col gap-2 mt-2">
          <div className="text-sm text-white/90"><span className="text-primary/70 text-[10px] uppercase font-bold mr-2">DEF:</span>{parts[0]}</div>
          <div className="text-xs text-white/60"><span className="text-secondary/70 text-[10px] uppercase font-bold mr-2">TONE:</span>{parts[1]}</div>
          <div className="text-xs text-white/50 italic"><span className="text-tertiary/70 text-[10px] uppercase font-bold mr-2">EX:</span>{parts.slice(2).join(' | ')}</div>
        </div>
      );
    }
    return text; // Fallback for unstructured text
  };

  return (
    <div className={`group relative border transition-all rounded-2xl p-6 ${isApproved ? 'border-secondary/20 bg-[#131315]' : 'border-white/5 bg-[#131315] hover:border-primary/30 hover:shadow-[0_0_30px_rgba(251,81,251,0.05)]'}`}>
      
      {/* Structural Header */}
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 opacity-50">
            <Type size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{card.type}</span>
          </div>
          {/* Tag Rendering (Showing Context/Scene) */}
          <div className="flex gap-1.5 flex-wrap">
            {card.tags.map(tag => (
              <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${tag.startsWith('Scene:') ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                {tag.replace('Scene:', '🎬 ')}
              </span>
            ))}
          </div>
        </div>
        
        {/* Granular Control Tools */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => card.id && onToggleApprove(card.id)}
            className={`p-1.5 rounded-md transition-all flex items-center gap-1 ${isApproved ? 'text-secondary bg-secondary/10 hover:bg-secondary/20' : 'text-white/20 hover:text-white hover:bg-white/10'}`}
            title={isApproved ? "Revert to Draft" : "Validate Chunk"}
          >
            {isApproved ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          </button>
          <button 
            onClick={() => card.id && onDelete(card.id)}
            className="text-white/20 hover:text-error hover:bg-error/10 p-1.5 rounded-md transition-all"
            title="Purge Node"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Editable Properties */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">{renderFront(card.front)}</div>
          <div 
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => card.id && onUpdate(card.id, { front: e.currentTarget.innerText })}
            className="text-sm font-medium text-transparent caret-white outline-none border-b border-transparent focus:border-primary/50 pb-1 z-10 relative"
          >
            {card.front}
          </div>
        </div>
        
        <div 
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => card.id && onUpdate(card.id, { back: e.currentTarget.innerText })}
          className="outline-none border-b border-transparent focus:border-primary/50 pb-1"
        >
          {/* We render the raw text in edit mode, but visually styled when not focused. For simplicity in React contentEditable, we just show raw text, allowing the user to edit the pipes directly. */}
          {card.back}
        </div>
        <div className="pointer-events-none opacity-80 border-l-2 border-white/10 pl-3">
           {renderBack(card.back)}
        </div>
      </div>
    </div>
  );
}
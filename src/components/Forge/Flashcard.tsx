'use client';

import React from 'react';
import { Trash2, CheckCircle2, Type, AlertCircle } from 'lucide-react';
import { AnkiCard } from '@/lib/db';

interface FlashcardProps {
  card: AnkiCard;
  onUpdate: (id: number, updates: Partial<AnkiCard>) => void;
  onDelete: (id: number) => void;
  onToggleApprove: (id: number) => void;
}

export default function Flashcard({ card, onUpdate, onDelete, onToggleApprove }: FlashcardProps) {
  const isApproved = card.status === 'approved';

  return (
    <div className={`group relative border transition-all rounded-2xl p-6 ${isApproved ? 'border-[#83fc8e]/20 bg-[#131315]' : 'border-white/5 bg-[#131315] hover:border-[#ff7afa]/30 hover:shadow-[0_0_30px_rgba(255,122,250,0.05)]'}`}>
      
      {/* Structural Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 opacity-40">
          <Type size={12} />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {card.type} Card
          </span>
        </div>
        
        {/* Granular Control Tools */}
        <div className="flex items-center gap-2">
          {/* Individual Validation Toggle */}
          <button 
            onClick={() => card.id && onToggleApprove(card.id)}
            className={`p-1.5 rounded-md transition-all flex items-center gap-1 ${isApproved ? 'text-secondary bg-secondary/10 hover:bg-secondary/20' : 'text-white/20 hover:text-white hover:bg-white/10'}`}
            title={isApproved ? "Revert to Draft" : "Approve Card"}
          >
            {isApproved ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          </button>

          {/* Destructive Action */}
          <button 
            onClick={() => card.id && onDelete(card.id)}
            className="text-white/20 hover:text-error hover:bg-error/10 p-1.5 rounded-md transition-all flex items-center gap-1"
            title="Delete Card"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Editable Properties */}
      <div className="space-y-4">
        <div 
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => card.id && onUpdate(card.id, { front: e.currentTarget.innerText })}
          className="text-sm font-medium text-white/90 outline-none border-b border-transparent focus:border-[#ff7afa]/50 pb-1"
        >
          {card.front}
        </div>
        <div 
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => card.id && onUpdate(card.id, { back: e.currentTarget.innerText })}
          className="text-xs text-white/40 italic outline-none border-b border-transparent focus:border-[#ff7afa]/50 pb-1"
        >
          {card.back}
        </div>
      </div>
    </div>
  );
}
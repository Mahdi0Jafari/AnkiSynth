'use client';

import React, { useRef, useEffect } from 'react';
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
  
  // Refs for safe contentEditable management
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  // Sync refs with props on initial load or external update, preventing cursor jumps
  useEffect(() => {
    if (frontRef.current && frontRef.current.innerText !== card.front) {
      frontRef.current.innerText = card.front;
    }
    if (backRef.current && backRef.current.innerText !== card.back) {
      backRef.current.innerText = card.back;
    }
  }, [card.front, card.back]);

  const renderFrontBackground = (text: string) => {
    return text.split(/(\{\{c1::.*?\}\})/).map((part, index) => {
      if (part.startsWith('{{c1::') && part.endsWith('}}')) {
        return <span key={index} className="text-tertiary font-mono bg-tertiary/10 px-1 rounded">{part}</span>;
      }
      return part;
    });
  };

  const renderBackPreview = (text: string) => {
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
    return null; // Don't show preview if it doesn't match the schema
  };

  return (
    <div className={`group relative border transition-all rounded-2xl p-6 ${isApproved ? 'border-secondary/20 bg-[#131315]' : 'border-white/5 bg-[#131315] hover:border-primary/30 hover:shadow-[0_0_30px_rgba(251,81,251,0.05)]'}`}>
      
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 opacity-50">
            <Type size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{card.type}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {card.tags.map(tag => (
              <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${tag.startsWith('Scene:') ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                {tag.replace('Scene:', '🎬 ')}
              </span>
            ))}
          </div>
        </div>
        
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

      <div className="space-y-4">
        <div className="relative">
          {/* Visual highlight layer (underneath the text) */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none whitespace-pre-wrap word-break-words opacity-50">
            {renderFrontBackground(card.front)}
          </div>
          {/* Editable text layer */}
          <div 
            ref={frontRef}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const newText = e.currentTarget.innerText;
              if (newText !== card.front && card.id) {
                onUpdate(card.id, { front: newText });
              }
            }}
            className="text-sm font-medium outline-none border-b border-transparent focus:border-primary/50 pb-1 z-10 relative"
          />
        </div>
        
        <div className="space-y-2">
           <div 
              ref={backRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const newText = e.currentTarget.innerText;
                if (newText !== card.back && card.id) {
                  onUpdate(card.id, { back: newText });
                }
              }}
              className="outline-none border-b border-transparent focus:border-primary/50 pb-1 text-xs text-white/70"
            />
            
            {/* Render the parsed preview only if it matches the schema */}
            {card.back.includes('|') && (
               <div className="pointer-events-none opacity-80 border-l-2 border-white/10 pl-3 mt-2 bg-black/20 p-2 rounded-r-lg">
                  {renderBackPreview(card.back)}
               </div>
            )}
        </div>
      </div>
    </div>
  );
}
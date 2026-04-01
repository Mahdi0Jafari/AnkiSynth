'use client';

import React, { useState } from 'react';
import { Trash2, CheckCircle2, Type, AlertCircle, Edit2 } from 'lucide-react';
import { AnkiCard } from '@/lib/db';

interface FlashcardProps {
  card: AnkiCard;
  onUpdate: (id: number, updates: Partial<AnkiCard>) => void;
  onDelete: (id: number) => void;
  onToggleApprove: (id: number) => void;
}

export default function Flashcard({ card, onUpdate, onDelete, onToggleApprove }: FlashcardProps) {
  const isApproved = card.status === 'approved';
  
  // State to manage edit mode toggle
  const [isEditingFront, setIsEditingFront] = useState(false);
  const [isEditingBack, setIsEditingBack] = useState(false);

  // Renders the cloze syntax cleanly when NOT in edit mode
  const renderFrontDisplay = (text: string) => {
    return text.split(/(\{\{c1::.*?\}\})/).map((part, index) => {
      if (part.startsWith('{{c1::') && part.endsWith('}}')) {
        const cleanText = part.replace('{{c1::', '').replace('}}', '');
        return (
          <span key={index} className="text-tertiary font-mono bg-tertiary/10 px-1.5 py-0.5 rounded border border-tertiary/20" dir="auto">
            {cleanText}
          </span>
        );
      }
      return <span key={index} dir="auto">{part}</span>;
    });
  };

  // Parses the structured back string into UI elements
  // Added dir="auto" for Multi-language support (Persian/Arabic etc.)
  const renderBackDisplay = (text: string) => {
    const parts = text.split('|').map(p => p.trim());
    if (parts.length >= 3) {
      return (
        <div className="flex flex-col gap-2.5">
          <div className="text-sm text-white/90" dir="auto">
            <span className="text-primary/80 text-[10px] uppercase font-bold mr-2 tracking-widest bg-primary/10 px-1 rounded inline-block" dir="ltr">DEF</span>
            {parts[0].replace('[Definition:', '').replace(']', '')}
          </div>
          <div className="text-xs text-white/70" dir="auto">
            <span className="text-secondary/80 text-[10px] uppercase font-bold mr-2 tracking-widest bg-secondary/10 px-1 rounded inline-block" dir="ltr">TONE</span>
            {parts[1].replace('[Tone/Pragmatics:', '').replace(']', '')}
          </div>
          <div className="text-xs text-white/50 italic border-l-2 border-tertiary/30 pl-3 py-1" dir="auto">
            {parts.slice(2).join(' | ').replace('[Example:', '').replace(']', '')}
          </div>
        </div>
      );
    }
    // Fallback if the AI fails the schema formatting
    return <div className="text-sm text-white/70" dir="auto">{text}</div>;
  };

  return (
    <div className={`group relative border transition-all duration-300 rounded-2xl p-6 ${isApproved ? 'border-secondary/20 bg-[#131315]/80' : 'border-white/5 bg-[#131315] hover:border-primary/30 hover:shadow-[0_0_30px_rgba(251,81,251,0.03)]'}`}>
      
      {/* Header section */}
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 opacity-50">
            <Type size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{card.type}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {card.tags.map(tag => (
              <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${tag.startsWith('Scene:') ? 'bg-primary/20 text-primary border border-primary/20' : 'bg-white/5 text-white/40 border border-white/5'}`}>
                {tag.replace('Scene:', '🎬 ')}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => card.id && onToggleApprove(card.id)}
            className={`p-1.5 rounded-lg transition-all flex items-center gap-1.5 ${isApproved ? 'text-secondary bg-secondary/10 hover:bg-secondary/20 border border-secondary/20' : 'text-white/40 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10'}`}
            title={isApproved ? "Revert to Draft" : "Validate Chunk"}
          >
            {isApproved ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          </button>
          <button 
            onClick={() => card.id && onDelete(card.id)}
            className="text-white/20 hover:text-error hover:bg-error/10 p-1.5 rounded-lg transition-all border border-transparent hover:border-error/20"
            title="Purge Node"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        
        {/* Front Field */}
        <div className="relative group/field">
          {isEditingFront ? (
            <textarea
              autoFocus
              dir="auto"
              defaultValue={card.front}
              onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
              onBlur={(e) => {
                const newText = e.target.value;
                if (newText !== card.front && card.id) {
                  onUpdate(card.id, { front: newText });
                }
                setIsEditingFront(false);
              }}
              className="w-full text-sm font-medium outline-none border border-primary/50 text-white/90 bg-black/40 p-3 rounded-lg min-h-[60px] resize-none custom-scrollbar shadow-inner"
            />
          ) : (
            <div 
              onClick={() => setIsEditingFront(true)}
              className="text-sm font-medium text-white/90 cursor-text hover:bg-white/5 p-2 rounded -mx-2 transition-colors border-b border-transparent hover:border-white/10 min-h-[40px]"
              title="Click to edit raw syntax"
            >
              {renderFrontDisplay(card.front)}
              <Edit2 size={12} className="inline ml-2 opacity-0 group-hover/field:opacity-30 transition-opacity" />
            </div>
          )}
        </div>
        
        {/* Back Field */}
        <div className="relative group/field bg-black/20 rounded-xl p-4 border border-white/5">
          {isEditingBack ? (
            <textarea
              autoFocus
              dir="auto"
              defaultValue={card.back}
              onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
              onBlur={(e) => {
                const newText = e.target.value;
                if (newText !== card.back && card.id) {
                  onUpdate(card.id, { back: newText });
                }
                setIsEditingBack(false);
              }}
              className="w-full outline-none border border-primary/50 text-xs text-secondary/90 font-mono bg-black/40 p-3 rounded-lg min-h-[80px] resize-none custom-scrollbar shadow-inner"
            />
          ) : (
            <div 
              onClick={() => setIsEditingBack(true)}
              className="cursor-text group-hover/field:bg-white/5 p-2 -m-2 rounded transition-colors"
              title="Click to edit raw format"
            >
               {renderBackDisplay(card.back)}
               <div className="absolute top-2 right-2 opacity-0 group-hover/field:opacity-30 transition-opacity">
                 <Edit2 size={12} className="text-white" />
               </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
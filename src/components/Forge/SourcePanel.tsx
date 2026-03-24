'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, Plus, Trash2, Lightbulb, Upload } from 'lucide-react';
import { useAiForge, CardTypePreference } from '@/hooks/useAiForge';
import { useAnkiDB } from '@/hooks/useAnkiDB';

export default function SourcePanel() {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [text, setText] = useState('');
  const [manualCard, setManualCard] = useState({ front: '', back: '' });
  const [cardType, setCardType] = useState<CardTypePreference>('mixed');
  const [isParsing, setIsParsing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { forgeCards, isForging, error } = useAiForge();
  const { addCard } = useAnkiDB();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      if (file.type === 'application/pdf') {
        // Bulletproof dynamic import for Next.js 14 Webpack limits
        const pdfjsLib = await import('pdfjs-dist/build/pdf.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let extractedText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          extractedText += pageText + '\n\n';
        }
        setText(extractedText.substring(0, 15000)); // Token safety limit
      } else if (file.type === 'text/plain' || file.name.endsWith('.md')) {
        const extractedText = await file.text();
        setText(extractedText);
      } else {
        alert("Unsupported format. Please upload PDF, TXT, or MD files.");
      }
    } catch (err) {
      console.error("Extraction Core Error:", err);
      alert("Failed to parse document. Ensure it is not encrypted.");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualAdd = async () => {
    if (!manualCard.front || !manualCard.back) return;
    await addCard({
      ...manualCard,
      type: 'basic',
      status: 'approved',
      tags: ['manual-entry']
    });
    setManualCard({ front: '', back: '' });
  };

  const insertExample = () => {
    setText("The dopaminergic system in the human brain primarily utilizes dopamine to transmit signals. The mesolimbic pathway, or 'reward pathway', connects the VTA to the nucleus accumbens. Elevated dopamine levels here reinforce behaviors like eating or social interaction.");
  };

  return (
    <div className="flex flex-col h-full p-6 md:p-10 space-y-6 overflow-y-auto custom-scrollbar">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
          <button 
            onClick={() => setMode('ai')} 
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'ai' ? 'bg-primary text-black' : 'text-white/40 hover:text-white/60'}`}
          >
            AI Forge
          </button>
          <button 
            onClick={() => setMode('manual')} 
            className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === 'manual' ? 'bg-secondary text-black' : 'text-white/40 hover:text-white/60'}`}
          >
            Manual
          </button>
        </div>

        {mode === 'ai' && (
          <div className="flex items-center">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.md" className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isParsing || isForging} 
              className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-white/5 rounded-lg text-[10px] uppercase font-bold text-white/80 hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {isParsing ? <Sparkles size={14} className="animate-pulse" /> : <Upload size={14} />}
              {isParsing ? 'Parsing Document...' : 'Import Data'}
            </button>
          </div>
        )}
      </div>

      {mode === 'ai' ? (
        <div className="flex-1 flex flex-col space-y-4 min-h-0">
          <div className="flex items-center gap-2 p-1 bg-[#131315] border border-white/5 rounded-lg self-start">
            {(['mixed', 'qna', 'cloze'] as const).map(type => (
              <button
                key={type}
                onClick={() => setCardType(type)}
                className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${cardType === type ? 'bg-white/10 text-white shadow-sm' : 'text-white/30 hover:text-white/60'}`}
              >
                {type === 'qna' ? 'Q&A Only' : type === 'cloze' ? 'Cloze Only' : 'Mixed Deck'}
              </button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Initialize forge sequence. Paste text or import a document..."
            disabled={isForging || isParsing}
            className="flex-1 w-full bg-surface-container-low rounded-2xl p-6 font-body text-sm leading-relaxed text-on-surface-variant focus:text-on-surface outline-none border border-white/5 focus:border-primary/30 transition-all resize-none custom-scrollbar disabled:opacity-50"
          />
          
          <div className="flex justify-between items-center pt-2">
             <div className="flex gap-4">
               <button onClick={() => setText('')} className="text-[10px] text-white/20 hover:text-error flex items-center gap-1.5 uppercase tracking-widest font-bold transition-colors">
                 <Trash2 size={14}/> Clear Memory
               </button>
               <button onClick={insertExample} className="text-[10px] text-white/20 hover:text-tertiary flex items-center gap-1.5 uppercase tracking-widest font-bold transition-colors">
                 <Lightbulb size={14}/> Load Example
               </button>
             </div>
             
             <button 
                onClick={() => forgeCards(text, cardType)}
                disabled={isForging || !text.trim() || isParsing}
                className="bg-primary text-black px-8 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-lg shadow-primary/20"
             >
               <Sparkles size={16} className={isForging ? 'animate-pulse' : ''} /> 
               {isForging ? 'Synthesizing...' : 'Execute Forge'}
             </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] uppercase tracking-widest text-white/20 font-bold ml-1">Front (Stimulus)</label>
            <textarea 
              value={manualCard.front} 
              onChange={e => setManualCard({...manualCard, front: e.target.value})} 
              className="w-full h-32 bg-surface-container-low border border-white/5 rounded-xl p-4 outline-none focus:border-secondary/50 text-sm font-medium resize-none custom-scrollbar"
              placeholder="Enter the question or context..."
            />
          </div>
          <div className="space-y-2 flex-1 flex flex-col">
            <label className="text-[9px] uppercase tracking-widest text-white/20 font-bold ml-1">Back (Response)</label>
            <textarea 
              value={manualCard.back} 
              onChange={e => setManualCard({...manualCard, back: e.target.value})} 
              className="w-full h-32 bg-surface-container-low border border-white/5 rounded-xl p-4 outline-none focus:border-secondary/50 text-sm text-secondary resize-none custom-scrollbar"
              placeholder="Enter the correct answer..."
            />
          </div>
          <button 
            onClick={handleManualAdd} 
            disabled={!manualCard.front || !manualCard.back} 
            className="bg-secondary text-black w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-30 transition-all active:scale-[0.98] shadow-lg shadow-secondary/10"
          >
            <Plus size={18} /> Append to Database
          </button>
        </div>
      )}
      
      {error && (
        <div className="text-[10px] text-error font-mono px-4 py-3 bg-error/5 border border-error/10 rounded-xl animate-in fade-in slide-in-from-bottom-2">
          <span className="font-bold">SYS_ERR:</span> {error}
        </div>
      )}
    </div>
  );
}
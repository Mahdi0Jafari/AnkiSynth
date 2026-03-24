'use client';
import React from 'react';
import { Github, Twitter, Linkedin, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="h-12 border-t border-white/5 flex items-center justify-between px-6 md:px-10 text-[10px] font-medium shrink-0 bg-[#0e0e10]">
      
      {/* Shortcut Hints */}
      <div className="hidden md:flex gap-6 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">⌘ Enter</span> Forge
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/80">⌘ S</span> Save
        </div>
      </div>
      
      {/* SEO & Personal Branding Matrix */}
      <div className="flex-1 md:flex-none flex items-center justify-center md:justify-end gap-5">
        <div className="flex items-center gap-3">
          <a href="https://github.com/Mahdi0Jafari" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" title="GitHub">
            <Github size={14} />
          </a>
          {/* Using 'Send' icon as a standard proxy for Telegram in Lucide */}
          <a href="https://t.me/Mahdi0Jafari" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-[#2AABEE] transition-colors" title="Telegram">
            <Send size={14} />
          </a>
          <a href="https://x.com/Mahdi0Jafari" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors" title="X (Twitter)">
            <Twitter size={14} />
          </a>
          <a href="https://linkedin.com/in/Mahdi0Jafari" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-[#0A66C2] transition-colors" title="LinkedIn">
            <Linkedin size={14} />
          </a>
        </div>
        
        {/* Core Branding Text */}
        <div className="tracking-widest opacity-60 uppercase font-bold text-white/90">
          Mahdi Jafari
        </div>
      </div>

    </footer>
  );
}
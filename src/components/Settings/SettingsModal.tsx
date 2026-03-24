'use client';
import React, { useState } from 'react';
import { X, KeyRound, Server, Cpu, Save, Download, Upload } from 'lucide-react';
import { useSettings } from '@/store/useSettings';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const settings = useSettings();
  
  // کپی محلی برای جلوگیری از تغییر زنده تنظیمات قبل از ذخیره‌سازی
  const [localSettings, setLocalSettings] = useState({
    apiKey: settings.apiKey,
    baseUrl: settings.baseUrl,
    model: settings.model
  });

  const handleSave = () => {
    settings.setSettings(localSettings);
    onClose();
  };

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-[420px] bg-surface-container-high border border-white/10 rounded-2xl p-6 shadow-2xl relative"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/80">System Engine</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <KeyRound size={12} /> OpenAI API Key
            </label>
            <input 
              type="password" 
              value={localSettings.apiKey} 
              onChange={e => setLocalSettings({...localSettings, apiKey: e.target.value})} 
              className="w-full bg-black/50 border border-white/5 rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:border-primary/50 outline-none transition-colors placeholder:text-white/10" 
              placeholder="sk-..." 
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <Server size={12} /> API Base URL
            </label>
            <input 
              type="text" 
              value={localSettings.baseUrl} 
              onChange={e => setLocalSettings({...localSettings, baseUrl: e.target.value})} 
              className="w-full bg-black/50 border border-white/5 rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:border-primary/50 outline-none transition-colors" 
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <Cpu size={12} /> Language Model
            </label>
            <input 
              type="text" 
              value={localSettings.model} 
              onChange={e => setLocalSettings({...localSettings, model: e.target.value})} 
              className="w-full bg-black/50 border border-white/5 rounded-lg px-4 py-2.5 text-sm font-mono text-white focus:border-primary/50 outline-none transition-colors" 
            />
          </div>

          {/* Data Management Section Placeholder for Future Expansion */}
          <div className="pt-4 border-t border-white/5 space-y-4">
            <h3 className="text-[9px] uppercase tracking-widest text-white/20 font-bold text-center">Data Configuration (Coming Soon)</h3>
            <div className="grid grid-cols-2 gap-3 opacity-50 pointer-events-none">
              <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase font-bold">
                <Download size={14} /> Export
              </button>
              <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase font-bold">
                <Upload size={14} /> Import
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleSave}
            className="w-full bg-primary text-black py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98] mt-4"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
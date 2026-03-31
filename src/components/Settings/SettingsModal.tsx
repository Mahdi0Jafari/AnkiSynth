'use client';
import React, { useState, useRef, useCallback } from 'react';
import { X, KeyRound, Server, Cpu, Save, DownloadCloud, UploadCloud, Shield, AlertTriangle, CheckCircle2, Loader2, Database, HardDrive } from 'lucide-react';
import { useSettings } from '@/store/useSettings';
import { useAnkiDB } from '@/hooks/useAnkiDB';
import { parseSnapshotFile, type AnkiSynthSnapshot } from '@/hooks/useAnkiDB';

// ─── Vault State Machine ────────────────────────────────────
type VaultState = 
  | { phase: 'idle' }
  | { phase: 'parsing' }
  | { phase: 'confirm'; snapshot: AnkiSynthSnapshot; fileName: string }
  | { phase: 'importing' }
  | { phase: 'success'; deckCount: number; cardCount: number }
  | { phase: 'exported' }
  | { phase: 'error'; message: string };

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const settings = useSettings();
  const { totalDeckCount, totalCardCount, exportDatabase, importDatabase } = useAnkiDB();
  
  const [localSettings, setLocalSettings] = useState({
    apiKey: settings.apiKey,
    baseUrl: settings.baseUrl,
    model: settings.model
  });

  const [vaultState, setVaultState] = useState<VaultState>({ phase: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    settings.setSettings(localSettings);
    onClose();
  };

  // ═══════════════════════════════════════════════════════════
  //  VAULT HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleExport = useCallback(async () => {
    try {
      await exportDatabase();
      setVaultState({ phase: 'exported' });
      setTimeout(() => setVaultState({ phase: 'idle' }), 2500);
    } catch {
      setVaultState({ phase: 'error', message: 'Export failed unexpectedly.' });
    }
  }, [exportDatabase]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVaultState({ phase: 'parsing' });
    const { snapshot, error } = await parseSnapshotFile(file);

    if (error || !snapshot) {
      setVaultState({ phase: 'error', message: error || 'Unknown parsing error.' });
    } else {
      setVaultState({ phase: 'confirm', snapshot, fileName: file.name });
    }

    // Reset file input so re-selecting the same file works
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (vaultState.phase !== 'confirm') return;
    const { snapshot } = vaultState;

    setVaultState({ phase: 'importing' });
    const result = await importDatabase(snapshot);

    if (result.success) {
      setVaultState({ phase: 'success', deckCount: result.deckCount, cardCount: result.cardCount });
    } else {
      setVaultState({ phase: 'error', message: result.error || 'Import failed.' });
    }
  }, [vaultState, importDatabase]);

  const resetVault = useCallback(() => {
    setVaultState({ phase: 'idle' });
  }, []);

  // ═══════════════════════════════════════════════════════════
  //  VAULT UI SUB-COMPONENT
  // ═══════════════════════════════════════════════════════════

  const renderVaultContent = () => {
    switch (vaultState.phase) {
      case 'idle':
      case 'exported':
        return (
          <div className="space-y-3">
            {/* Current DB Stats */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-white/30 font-mono py-1">
              <span className="flex items-center gap-1.5">
                <Database size={10} className="text-primary/50" />
                {totalDeckCount} {totalDeckCount === 1 ? 'deck' : 'decks'}
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <HardDrive size={10} className="text-primary/50" />
                {totalCardCount} {totalCardCount === 1 ? 'card' : 'cards'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleExport}
                id="vault-export-btn"
                className="group relative flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-b from-white/[0.07] to-white/[0.03] border border-white/10 rounded-xl text-[10px] uppercase font-bold tracking-wider text-white/70 hover:text-secondary hover:border-secondary/30 hover:shadow-[0_0_15px_rgba(131,252,142,0.1)] transition-all duration-300 active:scale-[0.97]"
              >
                <DownloadCloud size={14} className="group-hover:animate-bounce" />
                Export
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                id="vault-import-btn"
                className="group relative flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-b from-white/[0.07] to-white/[0.03] border border-white/10 rounded-xl text-[10px] uppercase font-bold tracking-wider text-white/70 hover:text-primary hover:border-primary/30 hover:shadow-[0_0_15px_rgba(251,81,251,0.1)] transition-all duration-300 active:scale-[0.97]"
              >
                <UploadCloud size={14} className="group-hover:animate-bounce" />
                Import
              </button>
            </div>

            {/* Export success flash */}
            {vaultState.phase === 'exported' && (
              <div className="flex items-center justify-center gap-2 text-[10px] text-secondary font-mono py-1 animate-in fade-in duration-300">
                <CheckCircle2 size={12} />
                Snapshot downloaded successfully
              </div>
            )}
          </div>
        );

      case 'parsing':
        return (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Loader2 size={20} className="text-primary animate-spin" />
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Validating snapshot...</span>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Warning Banner */}
            <div className="flex items-start gap-2.5 p-3 bg-tertiary/5 border border-tertiary/20 rounded-xl">
              <AlertTriangle size={16} className="text-tertiary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-tertiary">Overwrite Warning</p>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  This will <span className="text-tertiary font-bold">replace all existing data</span> with the contents of <span className="text-white/70 font-mono">{vaultState.fileName}</span>.
                </p>
              </div>
            </div>

            {/* Snapshot Stats */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-white/40 font-mono py-1">
              <span className="flex items-center gap-1.5">
                <Database size={10} className="text-secondary/60" />
                {vaultState.snapshot.data.decks.length} decks
              </span>
              <span className="w-px h-3 bg-white/10" />
              <span className="flex items-center gap-1.5">
                <HardDrive size={10} className="text-secondary/60" />
                {vaultState.snapshot.data.cards.length} cards
              </span>
            </div>

            {/* Confirm / Cancel */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={resetVault}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] uppercase font-bold tracking-wider text-white/50 hover:text-white/80 hover:border-white/20 transition-all duration-200 active:scale-[0.97]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                id="vault-confirm-import-btn"
                className="px-3 py-2 bg-gradient-to-r from-error/20 to-tertiary/20 border border-error/30 rounded-xl text-[10px] uppercase font-bold tracking-wider text-error hover:brightness-125 transition-all duration-200 active:scale-[0.97]"
              >
                Confirm Overwrite
              </button>
            </div>
          </div>
        );

      case 'importing':
        return (
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <Loader2 size={20} className="text-tertiary animate-spin" />
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Rehydrating database...</span>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center gap-2 py-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="p-2.5 rounded-full bg-secondary/10 border border-secondary/20">
              <CheckCircle2 size={20} className="text-secondary" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">Database Restored</p>
            <p className="text-[10px] text-white/40 font-mono">
              {vaultState.deckCount} decks · {vaultState.cardCount} cards
            </p>
            <button 
              onClick={resetVault}
              className="mt-1 text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
            >
              Dismiss
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center gap-2 py-3 animate-in fade-in duration-300">
            <div className="p-2.5 rounded-full bg-error/10 border border-error/20">
              <AlertTriangle size={20} className="text-error" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-error font-bold">Operation Failed</p>
            <p className="text-[10px] text-white/40 font-mono text-center max-w-[250px]">{vaultState.message}</p>
            <button 
              onClick={resetVault}
              className="mt-1 text-[9px] uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
            >
              Dismiss
            </button>
          </div>
        );
    }
  };

  return (
    <div 
      onClick={onClose} 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-[420px] bg-surface-container-high border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
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

          {/* ═══════════════════════════════════════════════════════════ */}
          {/*  THE VAULT: Knowledge Management Center                   */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <h3 className="flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">
              <Shield size={10} className="text-primary/40" />
              The Vault
              <Shield size={10} className="text-primary/40" />
            </h3>

            {renderVaultContent()}

            {/* Hidden file input */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".asynth,.json"
              onChange={handleFileSelect}
              className="hidden" 
              id="vault-file-input"
            />
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
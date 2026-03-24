import { useEffect } from 'react';

interface ShortcutConfig {
  executeForge?: () => void;
  saveDeck?: () => void;
  viewLibrary?: () => void;
  viewForge?: () => void;
  toggleShortcuts?: () => void;
}

/**
 * Hook to manage global keyboard interactions.
 * Ensures high-speed workflow without UI interaction overhead.
 */
export const useKeyboardShortcuts = (actions: ShortcutConfig) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Determine if the user is currently typing in an input, textarea, or contentEditable element
      const activeElement = document.activeElement;
      const isTyping = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        (activeElement as HTMLElement).isContentEditable
      );

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Modifier-based shortcuts (Cmd/Ctrl) - Usually safe even when typing
      if (cmdOrCtrl && event.key === 'Enter') {
        event.preventDefault();
        actions.executeForge?.();
      }
      
      if (cmdOrCtrl && event.key.toLowerCase() === 's') {
        event.preventDefault();
        actions.saveDeck?.();
      }

      // Single-key shortcuts - MUST be ignored if the user is typing
      if (!isTyping) {
        if (event.key.toLowerCase() === 'l') {
          event.preventDefault();
          actions.viewLibrary?.();
        }

        if (event.key.toLowerCase() === 'f') {
          event.preventDefault();
          actions.viewForge?.();
        }

        // Standard convention: '?' opens the help/shortcuts menu
        if (event.key === '?') {
          event.preventDefault();
          actions.toggleShortcuts?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
};
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type AnkiCard, type AnkiDeck } from '../lib/db';
import { useNavigationStore } from '../store/useNavigationStore';

/**
 * Settings payload shape for snapshot portability.
 * Mirrors the Zustand settings store fields.
 */
export interface SnapshotSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  defaultInstructions: string;
}

/**
 * AnkiSynth Snapshot Schema
 * The canonical format for portable database backups (.asynth files).
 */
export interface AnkiSynthSnapshot {
  version: number;
  appVersion: string;
  exportedAt: string;
  settings?: SnapshotSettings;
  data: {
    decks: AnkiDeck[];
    cards: AnkiCard[];
  };
}

export interface ImportResult {
  success: boolean;
  deckCount: number;
  cardCount: number;
  settings?: SnapshotSettings;
  error?: string;
}

/**
 * تابع کمکی برای تولید هش محتوا
 * جهت جلوگیری از ایجاد کارت‌های تکراری در دیتابیس
 */
const generateContentHash = (front: string, back: string): string => {
  const combined = `${front.trim()}|${back.trim()}`;
  // یک متد ساده برای تولید هش 32 کاراکتری
  return btoa(encodeURIComponent(combined)).substring(0, 32);
};

/**
 * Validates the structure of a parsed snapshot before import.
 * Returns null if valid, or an error message string if invalid.
 */
const validateSnapshot = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') return 'Invalid file: not a JSON object.';
  const snap = data as Record<string, unknown>;
  if (typeof snap.version !== 'number') return 'Invalid file: missing schema version.';
  if (!snap.data || typeof snap.data !== 'object') return 'Invalid file: missing data payload.';
  const inner = snap.data as Record<string, unknown>;
  if (!Array.isArray(inner.decks)) return 'Invalid file: missing decks array.';
  if (!Array.isArray(inner.cards)) return 'Invalid file: missing cards array.';
  return null;
};

/**
 * Parse an .asynth / .json file without importing it.
 * Used for the confirmation dialog (preview stats before committing).
 */
export const parseSnapshotFile = async (file: File): Promise<{ snapshot?: AnkiSynthSnapshot; error?: string }> => {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const validationError = validateSnapshot(parsed);
    if (validationError) return { error: validationError };
    return { snapshot: parsed as AnkiSynthSnapshot };
  } catch {
    return { error: 'Failed to parse file. Ensure it is a valid .asynth or .json file.' };
  }
};

export const useAnkiDB = () => {
  const { activeDeckId, setActiveDeckId } = useNavigationStore();

  // ۱. واکشی کارت‌ها: مدیریت هوشمند بین حالت "New Deck" و "Edit Mode"
  const workspaceCards = useLiveQuery(() => {
    if (activeDeckId) {
      // حالت ویرایش: لود کارت‌های متعلق به دک انتخاب شده
      return db.cards.where('deckId').equals(activeDeckId).reverse().sortBy('createdAt');
    } else {
      // حالت دک جدید: لود کارت‌هایی که هنوز به هیچ دکی وصل نشده‌اند
      return db.cards.filter(c => !c.deckId).reverse().sortBy('createdAt');
    }
  }, [activeDeckId]);

  // ۲. لیست تمام دک‌های موجود در کتابخانه
  const libraryDecks = useLiveQuery(() => db.decks.orderBy('createdAt').reverse().toArray());

  // --- Total counts for the Vault UI ---
  const totalDeckCount = useLiveQuery(() => db.decks.count());
  const totalCardCount = useLiveQuery(() => db.cards.count());

  // ۳. افزودن کارت با قابلیت تشخیص تکراری (Deduplication)
  const addCard = async (card: Omit<AnkiCard, 'id' | 'createdAt' | 'sourceHash'>) => {
    const hash = generateContentHash(card.front, card.back);

    // بررسی اینکه آیا کارتی با این محتوا قبلاً در این دک وجود دارد یا خیر
    const existing = await db.cards.where('sourceHash').equals(hash).first();
    if (existing) {
      console.warn("Deduplication Core: Duplicate node detected. Skipping injection.");
      return existing.id;
    }

    return await db.cards.add({ 
      ...card, 
      sourceHash: hash,
      deckId: activeDeckId ?? undefined, // تبدیل null به undefined برای رعایت شمای Dexie
      createdAt: Date.now(), 
      status: 'draft', 
      tags: card.tags || [] 
    });
  };

  const updateCard = async (id: number, updates: Partial<AnkiCard>) => {
    // اگر محتوا تغییر کرد، هش باید مجدداً تولید شود
    if (updates.front || updates.back) {
      const current = await db.cards.get(id);
      if (current) {
        updates.sourceHash = generateContentHash(
          updates.front ?? current.front, 
          updates.back ?? current.back
        );
      }
    }
    return await db.cards.update(id, updates);
  };

  const deleteCard = async (id: number) => {
    return await db.cards.delete(id);
  };

  const toggleCardApproval = async (id: number) => {
    const card = await db.cards.get(id);
    if (card) {
      const newStatus = card.status === 'approved' ? 'draft' : 'approved';
      return await db.cards.update(id, { status: newStatus });
    }
  };

  const approveAll = async () => {
    const ids = workspaceCards?.filter(c => c.status === 'draft').map(c => c.id!) || [];
    if (ids.length > 0) {
      await db.cards.where('id').anyOf(ids).modify({ status: 'approved' });
    }
  };

  const clearWorkspace = async () => {
    if (activeDeckId) {
      setActiveDeckId(null);
    } else {
      const unsaved = await db.cards.filter(c => !c.deckId).toArray();
      if (unsaved.length > 0) {
        await db.cards.bulkDelete(unsaved.map(c => c.id!));
      }
    }
  };

  const saveToLibrary = async (deckName: string, cardsToArchive: AnkiCard[], existingDeckId?: number | null) => {
    let targetDeckId: number;

    if (existingDeckId) {
      await db.decks.update(existingDeckId, { name: deckName, cardCount: cardsToArchive.length });
      targetDeckId = existingDeckId;
    } else {
      const newId = await db.decks.add({ 
        name: deckName, 
        createdAt: Date.now(), 
        cardCount: cardsToArchive.length 
      });
      targetDeckId = newId as number;
    }

    const cardIds = cardsToArchive.map(c => c.id!);
    if (cardIds.length > 0) {
      await db.cards.where('id').anyOf(cardIds).modify({ 
        deckId: targetDeckId, 
        status: 'approved' 
      });
    }

    setActiveDeckId(targetDeckId);
    return targetDeckId;
  };

  const loadDeckToWorkspace = async (deckId: number) => {
    // پاکسازی کارت‌های یتیم (Orphan) قبل از لود دک جدید
    const unsaved = await db.cards.filter(c => !c.deckId).toArray();
    if (unsaved.length > 0) {
      await db.cards.bulkDelete(unsaved.map(c => c.id!));
    }
    setActiveDeckId(deckId);
  };

  const deleteDeck = async (deckId: number) => {
    await db.cards.where('deckId').equals(deckId).delete();
    await db.decks.delete(deckId);
    if (activeDeckId === deckId) {
      setActiveDeckId(null);
    }
  };

  // ═══════════════════════════════════════════════════════════
  //  DATA VAULT: Cold Storage Export & Database Rehydration
  // ═══════════════════════════════════════════════════════════

  /**
   * exportDatabase — Creates a full snapshot of the database (including settings)
   * and triggers a browser download as a branded .asynth file.
   */
  const exportDatabase = async (currentSettings: SnapshotSettings): Promise<void> => {
    const [allDecks, allCards] = await Promise.all([
      db.decks.toArray(),
      db.cards.toArray(),
    ]);

    const snapshot: AnkiSynthSnapshot = {
      version: 4,
      appVersion: '0.1.0',
      exportedAt: new Date().toISOString(),
      settings: currentSettings,
      data: {
        decks: allDecks,
        cards: allCards,
      },
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const a = document.createElement('a');
    a.href = url;
    a.download = `AnkiSynth_Backup_${timestamp}.asynth`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * importDatabase — Accepts a pre-validated snapshot and performs a
   * transactional wipe-and-replace of the entire database.
   * Call parseSnapshotFile() first to validate and preview.
   */
  const importDatabase = async (snapshot: AnkiSynthSnapshot): Promise<ImportResult> => {
    try {
      await db.transaction('rw', db.decks, db.cards, async () => {
        // Phase 1: Nuclear wipe
        await db.cards.clear();
        await db.decks.clear();

        // Phase 2: Rehydrate
        if (snapshot.data.decks.length > 0) {
          await db.decks.bulkAdd(snapshot.data.decks);
        }
        if (snapshot.data.cards.length > 0) {
          await db.cards.bulkAdd(snapshot.data.cards);
        }
      });

      // Reset navigation to clean state after import
      setActiveDeckId(null);

      return {
        success: true,
        deckCount: snapshot.data.decks.length,
        cardCount: snapshot.data.cards.length,
        settings: snapshot.settings,
      };
    } catch (err) {
      return {
        success: false,
        deckCount: 0,
        cardCount: 0,
        error: err instanceof Error ? err.message : 'Unknown import error.',
      };
    }
  };

  return {
    cards: workspaceCards || [],
    decks: libraryDecks || [],
    totalDeckCount: totalDeckCount ?? 0,
    totalCardCount: totalCardCount ?? 0,
    isLoading: workspaceCards === undefined,
    addCard,
    updateCard,
    deleteCard,
    toggleCardApproval,
    approveAll,
    clearWorkspace,
    saveToLibrary,
    loadDeckToWorkspace,
    deleteDeck,
    exportDatabase,
    importDatabase,
  };
};
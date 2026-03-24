import { useLiveQuery } from 'dexie-react-hooks';
import { db, type AnkiCard, type AnkiDeck } from '../lib/db';
import { useNavigationStore } from '../store/useNavigationStore';

/**
 * تابع کمکی برای تولید هش محتوا
 * جهت جلوگیری از ایجاد کارت‌های تکراری در دیتابیس
 */
const generateContentHash = (front: string, back: string): string => {
  const combined = `${front.trim()}|${back.trim()}`;
  // یک متد ساده برای تولید هش 32 کاراکتری
  return btoa(encodeURIComponent(combined)).substring(0, 32);
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

  return {
    cards: workspaceCards || [],
    decks: libraryDecks || [],
    isLoading: workspaceCards === undefined,
    addCard,
    updateCard,
    deleteCard,
    toggleCardApproval,
    approveAll,
    clearWorkspace,
    saveToLibrary,
    loadDeckToWorkspace,
    deleteDeck
  };
};
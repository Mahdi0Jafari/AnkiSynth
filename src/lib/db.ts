import Dexie, { type Table } from 'dexie';

export interface AnkiCard {
  id?: number;
  deckId?: number;      // کلید خارجی برای ارتباط با AnkiDeck
  front: string;
  back: string;
  type: 'basic' | 'cloze';
  sourceText?: string;
  sourceHash?: string;  // برای جلوگیری از ایجاد کارت‌های تکراری (Idempotency)
  createdAt: number;
  status: 'draft' | 'approved' | 'archived';
  tags: string[];
  modelName?: string;   // برای انطباق با Note Type‌های نرم‌افزار Anki در آینده
}

export interface AnkiDeck {
  id?: number;
  name: string;
  createdAt: number;
  cardCount: number;
}

export class AnkiSynthDB extends Dexie {
  cards!: Table<AnkiCard>;
  decks!: Table<AnkiDeck>;

  constructor() {
    super('AnkiSynthDB');
    
    /**
     * Version 3: Optimized Indexing & Deduplication Support
     * ++id: کلید اصلی خودکار
     * deckId: برای لود سریع کارت‌های یک دک (O(log n))
     * status: برای فیلتر کردن ورک‌بنچ
     * *tags: ایندکس Multi-entry (بسیار حیاتی برای جستجوی تگ‌ها)
     * sourceHash: ایندکس یکتا برای جلوگیری از افزونگی داده
     */
    this.version(3).stores({
      cards: '++id, deckId, status, createdAt, *tags, sourceHash',
      decks: '++id, name, createdAt'
    });
  }
}

export const db = new AnkiSynthDB();
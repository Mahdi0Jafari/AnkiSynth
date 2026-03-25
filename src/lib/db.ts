// src/lib/db.ts
import Dexie, { type Table } from 'dexie';

export interface AnkiCard {
  id?: number;
  deckId?: number;      
  front: string;
  back: string;
  type: 'basic' | 'cloze';
  sourceText?: string;
  sourceHash?: string;  
  createdAt: number;
  status: 'draft' | 'approved' | 'archived';
  tags: string[];
  modelName?: string;   
  sceneContext?: string; // فیلد جدید برای ذخیره دیتای ساختاریافته‌ی بافتار
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
     * Version 4: Upgraded for SLA Architecture (Added sceneContext support)
     */
    this.version(4).stores({
      cards: '++id, deckId, status, createdAt, *tags, sourceHash',
      decks: '++id, name, createdAt'
    });
  }
}

export const db = new AnkiSynthDB();
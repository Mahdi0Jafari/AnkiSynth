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
  chunkIndex?: number;  // NEW: Tracks which textual chunk generated this card (for telemetry & resume capabilities)
  createdAt: number;
  status: 'draft' | 'approved' | 'archived';
  tags: string[];
  modelName?: string;   
  sceneContext?: string; 
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
     * Version 4: Upgraded for SLA Architecture (sceneContext support)
     * Version 5: Incremental Processing upgrade (chunkIndex tracking)
     */
    this.version(5).stores({
      cards: '++id, deckId, status, createdAt, *tags, sourceHash, chunkIndex',
      decks: '++id, name, createdAt'
    });
  }
}

export const db = new AnkiSynthDB();
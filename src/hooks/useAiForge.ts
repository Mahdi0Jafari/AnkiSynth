// src/hooks/useAiForge.ts
import { useState } from 'react';
import { useSettings } from '../store/useSettings';
import { useAnkiDB } from './useAnkiDB';
import { SYSTEM_PROMPT } from '../lib/constants';

export type CardTypePreference = 'mixed' | 'qna' | 'cloze';

export interface ForgeProgress {
  current: number;
  total: number;
}

export const useAiForge = () => {
  const { apiKey, baseUrl, model } = useSettings();
  const { addCard } = useAnkiDB();
  const [isForging, setIsForging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // NEW: Telemetry state to feed progress bars in the UI
  const [progress, setProgress] = useState<ForgeProgress | null>(null);

  /**
   * Data Sanitization Layer
   * Strips out SRT/VTT timestamps, speaker tags, and excessive whitespace.
   * Drastically reduces token waste and prevents LLM hallucination on numbers.
   */
  const sanitizeSourceText = (text: string): string => {
    let cleaned = text;
    // Remove SRT timestamps (e.g., 00:00:01,000 --> 00:00:04,000)
    cleaned = cleaned.replace(/\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}/g, '');
    // Remove standalone subtitle index numbers
    cleaned = cleaned.replace(/^\d+$/gm, '');
    // Remove VTT speaker tags (e.g., <v Speaker Name>)
    cleaned = cleaned.replace(/<v [^>]+>/g, '').replace(/<\/v>/g, '');
    // Collapse excessive newlines created by deletion
    return cleaned.replace(/\n{3,}/g, '\n\n').trim();
  };

  const processChunk = async (chunkText: string, styleInstruction: string, customInstructions: string): Promise<any[]> => {
    const userMessage = `
      SOURCE TEXT (Identify Language & Context):
      "${chunkText}"
      
      USER'S EXPLICIT INSTRUCTIONS (PRIORITY OVERRIDE):
      ${customInstructions ? `"${customInstructions}"` : "Extract high-yield chunks based on standard SLA principles."}
      
      STYLE CONSTRAINT:
      ${styleInstruction}
      - Use professional/high-IQ linguistic terminology in the "Tone/Pragmatics" section.
      - Ensure one tag is ALWAYS the identified Scene/Atmosphere.
    `;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        response_format: { 
          type: "json_schema",
          json_schema: {
            name: "anki_cards_schema",
            strict: true,
            schema: {
              type: "object",
              properties: {
                cards: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      front: { type: "string" },
                      back: { type: "string" },
                      type: { type: "string", enum: ["basic", "cloze"] },
                      tags: { type: "array", items: { type: "string" } }
                    },
                    required: ["front", "back", "type", "tags"],
                    additionalProperties: false
                  }
                }
              },
              required: ["cards"],
              additionalProperties: false
            }
          }
        },
        temperature: 0.7 
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Protocol Error ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    return parsed.cards || [];
  };

  const forgeCards = async (sourceText: string, typePreference: CardTypePreference = 'mixed', customInstructions: string = '') => {
    if (!sourceText.trim()) return;
    
    if (!apiKey) {
      setError('Engine Offline: API Key required in settings.');
      return;
    }

    setIsForging(true);
    setError(null);
    setProgress({ current: 0, total: 0 });

    let styleInstruction = "STRATEGY: Hybrid Acquisition. Generate a mix of Cloze (for idioms/collocations) and Basic (for pragmatic logic).";
    
    if (typePreference === 'qna') {
      styleInstruction = `
        STRATEGY: Conceptual & Pragmatic Understanding.
        - Create ONLY Basic Q&A cards. DO NOT generate cloze deletions.
        - Front: Ask about the meaning, tone, or usage of a specific chunk from the text.
        - Back: Follow the [Definition] | [Tone/Pragmatics] | [Example] format.`;
    } else if (typePreference === 'cloze') {
      styleInstruction = `
        STRATEGY: Contextual Gap-Filling (Lexical Approach).
        - Create ONLY Cloze Deletion cards using {{c1::...}} syntax.
        - Target: Hide High-yield Phrasal Verbs, Idioms, or complex Collocations.
        - Example Front: "I need to {{c1::get my act together}} before the chef arrives."`;
    }

    try {
      // 1. Sanitize the raw input
      const sanitizedText = sanitizeSourceText(sourceText);

      // 2. Semantic Chunking (~2000 chars max)
      const paragraphs = sanitizedText.split(/\n\s*\n/);
      let currentChunk = '';
      const chunks: string[] = [];

      for (const p of paragraphs) {
        if (currentChunk.length + p.length > 2000) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = p;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + p;
        }
      }
      if (currentChunk) chunks.push(currentChunk.trim());

      // Initialize Progress
      setProgress({ current: 0, total: chunks.length });
      
      // 3. Sequential Processing & Atomic Commits
      // We process one chunk at a time to respect rate limits AND save instantly.
      for (let i = 0; i < chunks.length; i++) {
         const chunk = chunks[i];
         if(!chunk.trim()) continue;

         // Update telemetry before firing the API
         setProgress({ current: i + 1, total: chunks.length });

         const cards = await processChunk(chunk, styleInstruction, customInstructions);
         
         // INCREMENTAL SAVE: If the internet drops at chunk 5, chunks 1-4 are safely in the DB.
         if (cards && cards.length > 0) {
           await Promise.all(cards.map((card: any) => 
             addCard({
               front: card.front || 'Empty Front',
               back: card.back || 'Empty Back',
               type: card.type === 'cloze' ? 'cloze' : 'basic',
               status: 'draft',
               sourceText: sanitizedText.substring(0, 150), // Store a snippet of sanitized context
               tags: card.tags || ['AnkiSynth-AI'],
               chunkIndex: i // Added telemetry metadata mapping
             })
           ));
         }
      }
    } catch (err: any) {
      console.error("Forging failed:", err);
      setError(err.message || 'An unexpected error occurred during synthesis. Partial data may have been saved.');
    } finally {
      setIsForging(false);
      setProgress(null);
    }
  };

  // Export 'progress' alongside existing returns
  return { forgeCards, isForging, error, progress };
};
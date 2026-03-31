// src/hooks/useAiForge.ts
import { useState } from 'react';
import { useSettings } from '../store/useSettings';
import { useAnkiDB } from './useAnkiDB';
import { SYSTEM_PROMPT } from '../lib/constants';

export type CardTypePreference = 'mixed' | 'qna' | 'cloze';

export const useAiForge = () => {
  const { apiKey, baseUrl, model } = useSettings();
  const { addCard } = useAnkiDB();
  const [isForging, setIsForging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Added customInstructions to the parameter list
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
        // Temperature 0.7 allows for creative/deep pragmatic analysis, 
        // while structured outputs guarantee the JSON won't break.
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

  // Added customInstructions with a default empty string
  const forgeCards = async (sourceText: string, typePreference: CardTypePreference = 'mixed', customInstructions: string = '') => {
    if (!sourceText.trim()) return;
    
    if (!apiKey) {
      setError('Engine Offline: API Key required in settings.');
      return;
    }

    setIsForging(true);
    setError(null);

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
      // Basic Semantic Chunking (~2000 chars max)
      const paragraphs = sourceText.split(/\n\s*\n/);
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

      let allCards: any[] = [];
      
      // Process chunks sequentially to respect API rate limits
      for (const chunk of chunks) {
         if(!chunk.trim()) continue;
         const cards = await processChunk(chunk, styleInstruction, customInstructions);
         allCards = [...allCards, ...cards];
      }

      if (allCards.length > 0) {
        await Promise.all(allCards.map((card: any) => 
          addCard({
            front: card.front || 'Empty Front',
            back: card.back || 'Empty Back',
            type: card.type === 'cloze' ? 'cloze' : 'basic',
            status: 'draft',
            sourceText: sourceText.substring(0, 150),
            tags: card.tags || ['AnkiSynth-AI']
          })
        ));
      }
    } catch (err: any) {
      console.error("Forging failed:", err);
      setError(err.message || 'An unexpected error occurred during synthesis.');
    } finally {
      setIsForging(false);
    }
  };

  return { forgeCards, isForging, error };
};
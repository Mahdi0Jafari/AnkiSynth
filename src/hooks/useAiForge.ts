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

  const forgeCards = async (sourceText: string, typePreference: CardTypePreference = 'mixed') => {
    if (!sourceText.trim()) return;
    
    if (!apiKey) {
      setError('Engine Offline: API Key required in settings.');
      return;
    }

    setIsForging(true);
    setError(null);

    // تزریق دینامیک دستورات بر اساس انتخاب کاربر
    let styleInstruction = "Generate a mix of 'basic' and 'cloze' cards depending on what fits the context best.";
    if (typePreference === 'qna') {
      styleInstruction = "CRITICAL CONSTRAINT: Generate ONLY 'basic' (Q&A) cards. DO NOT generate cloze deletions.";
    } else if (typePreference === 'cloze') {
      styleInstruction = "CRITICAL CONSTRAINT: Generate ONLY 'cloze' deletion cards. The 'front' must contain the full sentence with [...], and the 'back' must contain the missing word(s).";
    }

    try {
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
            { role: 'user', content: `SOURCE TEXT:\n${sourceText}\n\n${styleInstruction}` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Protocol Error ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      const parsed = JSON.parse(content);

      if (parsed.cards && Array.isArray(parsed.cards)) {
        await Promise.all(parsed.cards.map((card: any) => 
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
// @ts-ignore
import AnkiExport from 'anki-apkg-export';
import { AnkiCard } from './db';

export const exportToAPKG = async (cards: AnkiCard[], deckName: string = 'AnkiSynth_Collection') => {
  if (!cards || cards.length === 0) {
    console.warn("Export Core: Zero validated items identified.");
    return;
  }

  try {
    console.log(`Executing export for ${cards.length} nodes to target: ${deckName}`);
    
    // @ts-ignore
    const apkg = new AnkiExport(deckName);

    cards.forEach(card => {
      const frontHTML = `
        <div style="font-family: 'Arial'; text-align: center; font-size: 22px; color: #ffffff; background: #0e0e10; padding: 40px; border-radius: 12px; border: 1px solid rgba(255,122,250,0.2);">
          ${card.front}
        </div>`;
      
      const backHTML = `
        <div style="font-family: 'Arial'; text-align: center; font-size: 18px; color: #ff7afa; background: #0e0e10; padding: 40px; border-radius: 12px;">
          <div style="margin-bottom: 20px; border-top: 1px solid #333; padding-top: 20px; opacity: 0.5; font-size: 12px; letter-spacing: 2px;">RESPONSE</div>
          ${card.back}
        </div>`;

      apkg.addCard(frontHTML, backHTML, { tags: card.tags });
    });

    const zipContent = await apkg.save();
    
    const blob = new Blob([zipContent], { type: 'application/apkg' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const safeFileName = deckName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeFileName}_${new Date().getTime()}.apkg`;
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

  } catch (error) {
    console.error('Core Engine Failure (APKG Component):', error);
    alert('Compilation error occurred during package generation.');
  }
};
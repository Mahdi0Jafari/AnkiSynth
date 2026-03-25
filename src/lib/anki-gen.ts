// @ts-ignore
import AnkiExport from 'anki-apkg-export';
import { AnkiCard } from './db';

export const exportToAPKG = async (cards: AnkiCard[], deckName: string = 'AnkiSynth_Collection') => {
  if (!cards || cards.length === 0) {
    console.warn("Export Core: Zero validated items identified.");
    return;
  }

  try {
    console.log(`Executing SLA export for ${cards.length} nodes to target: ${deckName}`);
    
    // @ts-ignore
    const apkg = new AnkiExport(deckName);

    cards.forEach(card => {
      const safeFront = card.front.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      
      const backParts = card.back.split('|').map(p => p.trim());
      let formattedBack = card.back;
      
      if (backParts.length >= 3) {
        formattedBack = `
          <div style="text-align: left; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; color: #f9f5f8;"><strong style="color: #fb51fb; font-size: 12px; letter-spacing: 1px;">DEF:</strong><br/>${backParts[0]}</p>
            <p style="margin: 0 0 10px 0; color: #adaaad;"><strong style="color: #83fc8e; font-size: 12px; letter-spacing: 1px;">TONE:</strong><br/>${backParts[1]}</p>
            <p style="margin: 0; color: #ffd16c; font-style: italic;"><strong style="color: #ffd16c; font-size: 12px; letter-spacing: 1px;">EX:</strong><br/>${backParts.slice(2).join(' | ')}</p>
          </div>
        `;
      }

      const frontHTML = `
        <div style="font-family: 'Inter', 'Arial', sans-serif; text-align: center; font-size: 24px; color: #ffffff; background: #0e0e10; padding: 40px; border-radius: 12px; border: 1px solid rgba(255,122,250,0.2); line-height: 1.5;">
          ${safeFront}
        </div>`;
      
      const backHTML = `
        <div style="font-family: 'Inter', 'Arial', sans-serif; font-size: 16px; color: #e0e0e0; background: #0e0e10; padding: 40px; border-radius: 12px;">
          <div style="margin-bottom: 25px; border-top: 1px solid #333; padding-top: 20px; opacity: 0.5; font-size: 11px; letter-spacing: 3px; text-align: center;">LINGUISTIC DECODING</div>
          ${formattedBack}
        </div>`;

      apkg.addCard(frontHTML, backHTML, { tags: [...card.tags, `Type:${card.type}`] });
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
    alert('Compilation error occurred during SLA package generation.');
  }
};
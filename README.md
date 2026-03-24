# ⚡ AnkiSynth AI | The Digital Forge

**AnkiSynth** is a high-performance knowledge extraction engine designed to bridge the gap between massive information consumption and long-term retention. By leveraging Large Language Models (LLMs), it synthesizes raw text, PDFs, and Markdown files into atomic, high-quality Anki flashcards.

---

## 🚀 Strategic Features

- **AI-Powered Synthesis (The Forge):** Transform dense academic text or documentation into "Basic" and "Cloze" deletion cards using optimized system prompts.
- **Local-First Architecture:** Powered by **Dexie.js (IndexedDB)**, ensuring your data stays in your browser with near-instant persistence and zero latency.
- **Advanced Workbench (Edit Mode):** A professional-grade editor to refine, edit, and validate cards. Supports a seamless "Load/Edit/Save" workflow to prevent data duplication.
- **Multi-Format Ingestion:** Native support for PDF parsing (via PDF.js), Markdown, and plain text.
- **Knowledge Vault:** A relational library to manage your stored decks. Restore any archived deck back to the workbench for further refinement.
- **Seamless Anki Integration:** Export validated cards directly into `.apkg` format or `.csv` for immediate use in Anki.

## 🛠 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Dexie.js](https://dexie.org/) (IndexedDB)
- **Icons:** [Lucide React](https://lucide.dev/)
- **AI Engine:** OpenAI API (GPT-4o-mini optimized)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/mahdi0jafari/AnkiSynth.git](https://github.com/mahdi0jafari/AnkiSynth.git)
   cd AnkiSynth
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure OpenAI API:**
   Launch the app, navigate to **Settings** (gear icon in sidebar), and input your `OpenAI API Key` and `Base URL`. Settings are persisted locally in your browser.

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment (GitHub Pages)

AnkiSynth is pre-configured for static export and GitHub Pages deployment.

1. **Build the project:**
   ```bash
   npm run build
   ```
2. The output will be generated in the `/out` directory.
3. Deploy the `/out` directory to your `gh-pages` branch.

*Note: The `basePath` is automatically set to `/AnkiSynth` in `next.config.js` for production builds.*

## 🧠 System Architecture

AnkiSynth utilizes a **Relational Local-First Schema** via IndexedDB:
- **Decks Table:** Manages collection metadata (Name, Card Count, CreatedAt).
- **Cards Table:** Stores individual flashcards with a relational mapping (`deckId`) to their parent collection.

This architecture ensures "State Hydration Integrity," allowing users to switch between creating new decks and editing existing ones without data collision or loss.

## 🤝 Contributing

Contributions are welcome. If you want to add new ingestion formats (OCR, YouTube Transcripts) or improve the synthesis prompts, feel free to open a PR.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed with operational sincerity and strategic depth by Mahdi Jafari.*

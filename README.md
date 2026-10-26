# Gyan Ranjan | Three-Experience Engineering Portfolio

A high-performance, cinematic personal website offering **three distinct visitor lenses** on the same underlying engineering foundation:

1. **💼 Recruiter Mode** — A clean, evidence-driven, professional presentation designed for a 30–60 second hiring assessment (Light theme by default with dark theme toggle; zero anime in content).
2. **⚡ Developer Mode** — An interactive technical deep dive into system architecture, AST parsers, vector similarity search in Qdrant, resilient LLM fallback chains, and real trade-offs.
3. **✨ Know Gyan** — An atmospheric, cinematic journey through personal engineering mindset, milestones, and vision, enriched by consistent character artwork.

Live Demo: [gyan-ranjan.vercel.app](https://gyan-ranjan.vercel.app/)

---

## 🚀 Key Features

- **Visitor Selection Screen ("How Would You Like to Know Me?")**: Fullscreen entry experience with interactive cards for Recruiter, Developer, and Know Gyan modes, complete with skip controls.
- **Persistent Segmented Lens Switcher**: Seamlessly switch between all three experiences at any time from the sticky navigation bar or footer.
- **Dual-Theme Recruiter Mode**: Light theme by default for maximum executive readability, with a sun/moon toggle for dark theme. Strictly professional with verified metrics (9.22 CGPA, 300+ DSA, HackSprint Winner).
- **Interactive Developer Rails & Blueprints**: Horizontal project catalogue with category filtering, screenshot carousels for RepoMind and DocOnCall, architecture pipeline diagrams, and trade-off comparison tables.
- **Storytelling Narrative in Know Gyan**: Apple-style visual pacing featuring custom-generated anime character artwork matching the visual concept sheet (hero portrait, dusk city skyline, and starry night epilogue).
- **Interactive Command Palette (`Ctrl + K` / `Cmd + K`)**: Keyboard-navigable quick actions menu to switch modes, search projects, download the resume, or view social profiles.
- **Zero Framework Hydration Overhead**: Built with pure semantic HTML5, modern CSS3, and Vanilla JavaScript for instant page loads.

---

## 🛠️ Tech Stack & Domain Expertise

- **AI & RAG Infrastructure**: LangChain, Qdrant Vector DB, Gemini 1.5 Flash / 2.5 Flash, Groq LLaMA 3.3 70B, AST Language Splitters.
- **Backend & APIs**: FastAPI (Async Python), Node.js, Express.js, MongoDB, RESTful Architecture, OAuth 2.0 / JWT, Docker.
- **Frontend & Systems**: Vanilla ES6+ JavaScript, CSS3 Design Tokens, Git, Vercel, Render, Hugging Face Spaces.

---

## 💻 Local Development

Run the website locally with any static HTTP server:

```bash
# Python 3
python -m http.server 8000
```

Navigate to `http://localhost:8000` in your web browser.

---

## 📁 Repository Structure

- `index.html` — The unified semantic markup housing the Entry Selector, Recruiter view, Developer view, Know Gyan view, and Command Palette.
- `style.css` — Modular design system with theme variables, glassmorphic headers, horizontal rails, and responsive layouts.
- `script.js` — Client-side runtime managing experience modes, theme toggles, carousels, category filtering, and the command palette.
- `images/anime/` — Coordinated male anime character artwork assets (`hero_portrait.jpg`, `about_city.jpg`, `dev_coding.jpg`, `closing_night.jpg`, and selector cards).
- `images/repomind/` & `images/doconcall/` — Production project screenshots.
- `resume.pdf` — Downloadable resume.

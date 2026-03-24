# Sparkdown

A markdown editor and publisher. Write markdown, preview with themes, export to HTML or PDF, share with encrypted links.

**Live:** [johnryancottam.com/tools/markdown-to-html](https://www.johnryancottam.com/tools/markdown-to-html)

## Features

- **Live preview** — real-time rendering as you type
- **5 HTML themes** — GitHub, Minimalist, Brutalist, Gen Z, Academic (light + dark)
- **Syntax highlighting** — Shiki with GitHub themes, 26+ languages
- **Frontmatter** — parses YAML frontmatter, renders as metadata card
- **Mermaid diagrams** — renders diagrams from fenced code blocks
- **Math/LaTeX** — KaTeX rendering for inline and block math
- **PDF export** — download styled PDFs (mobile-friendly fallback)
- **Share links** — compressed URLs with optional password + TTL
- **Drag & drop** — drop .md files directly into the editor
- **URL import** — fetch markdown from GitHub, Gist, or any raw URL
- **Keyboard shortcuts** — full shortcut support with cheat sheet
- **Scroll sync** — bidirectional proportional scrolling
- **Layout modes** — split, editor-only, or preview-only
- **Auto-save** — persist content to localStorage
- **Table of contents** — auto-generated, clickable headings
- **Dark mode** — system-aware with manual toggle
- **Theme loader** — apply shadcn themes from tweakcn.com URLs
- **Print-friendly** — clean print styles for browser printing

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- [Shiki](https://shiki.matsu.io/) for syntax highlighting
- [marked](https://github.com/markedjs/marked) for Markdown parsing
- [gray-matter](https://github.com/jonschlinkert/gray-matter) for frontmatter
- [Mermaid](https://mermaid.js.org/) for diagrams
- [KaTeX](https://katex.org/) for math rendering
- [lz-string](https://github.com/pieroxy/lz-string) for URL compression
- [crypto-js](https://github.com/brix/crypto-js) for share encryption

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## License

MIT

Built by [John Ryan Cottam](https://johnryancottam.com)

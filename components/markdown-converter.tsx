"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";
import matter from "gray-matter";
import { createHighlighter, type Highlighter } from "shiki";
import { toast } from "sonner";
import mermaid from "mermaid";
import katex from "katex";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sun,
  Moon,
  Copy,
  Download,
  Trash2,
  ExternalLink,
  Link,
  Save,
  Palette,
  X,
  Eye,
  FileText,
  Plus,
  List,
  HelpCircle,
  ArrowUpDown,
  Share2,
  Check,
} from "lucide-react";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

marked.setOptions({ gfm: true, breaks: true });

interface SavedDocument {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const SHIKI_LANGS = [
  "javascript",
  "typescript",
  "python",
  "html",
  "css",
  "bash",
  "json",
  "yaml",
  "markdown",
  "sql",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "diff",
  "xml",
  "jsx",
  "tsx",
  "vue",
  "astro",
  "text",
];

const GITHUB_THEME = {
  light: `
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #24292f; background: #fff; }
.markdown-body { max-width: 980px; margin: 0 auto; padding: 45px; }
@media (max-width: 767px) { .markdown-body { padding: 15px; } }
.markdown-body h1, .markdown-body h2 { padding-bottom: 0.3em; border-bottom: 1px solid #d0d7de; }
.markdown-body h1 { font-size: 2em; margin: 24px 0 16px; font-weight: 600; }
.markdown-body h2 { font-size: 1.5em; margin: 24px 0 16px; font-weight: 600; }
.markdown-body h3 { font-size: 1.25em; margin: 24px 0 16px; font-weight: 600; }
.markdown-body p { margin: 0 0 16px; }
.markdown-body ul, .markdown-body ol { margin: 0 0 16px; padding-left: 2em; }
.markdown-body li { margin-top: 0.25em; }
.markdown-body table { border-spacing: 0; border-collapse: collapse; width: 100%; margin: 0 0 16px; }
.markdown-body table th { font-weight: 600; padding: 6px 13px; border: 1px solid #d0d7de; background: #f6f8fa; }
.markdown-body table td { padding: 6px 13px; border: 1px solid #d0d7de; }
.markdown-body code { padding: 0.2em 0.4em; font-size: 85%; background: rgba(175,184,193,0.2); border-radius: 6px; font-family: ui-monospace, SFMono-Regular, monospace; }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background: #f6f8fa; border-radius: 6px; margin: 0 0 16px; }
.markdown-body pre code { padding: 0; background: transparent; display: block; }
.markdown-body blockquote { padding: 0 1em; color: #57606a; border-left: 0.25em solid #d0d7de; margin: 0 0 16px; }
.markdown-body a { color: #0969da; text-decoration: none; }
.markdown-body strong { font-weight: 600; }
.markdown-body hr { height: 0.25em; margin: 24px 0; background: #d0d7de; border: 0; }
.markdown-body img { max-width: 100%; }
.markdown-body ul:has(> li > input[type="checkbox"]) { list-style: none; padding-left: 0; }
.markdown-body li:has(> input[type="checkbox"]) { display: flex; align-items: baseline; gap: 0.5em; }
.markdown-body li > input[type="checkbox"] { margin-top: 0.125em; flex-shrink: 0; }
@media print {
  body { background: #fff !important; }
  .markdown-body { max-width: 100%; padding: 0; }
  @page { margin: 2cm; }
}
`,
  dark: `
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #e6edf3; background: #0d1117; }
.markdown-body { max-width: 980px; margin: 0 auto; padding: 45px; }
@media (max-width: 767px) { .markdown-body { padding: 15px; } }
.markdown-body h1, .markdown-body h2 { padding-bottom: 0.3em; border-bottom: 1px solid #30363d; }
.markdown-body h1 { font-size: 2em; margin: 24px 0 16px; font-weight: 600; }
.markdown-body h2 { font-size: 1.5em; margin: 24px 0 16px; font-weight: 600; }
.markdown-body h3 { font-size: 1.25em; margin: 24px 0 16px; font-weight: 600; }
.markdown-body p { margin: 0 0 16px; }
.markdown-body ul, .markdown-body ol { margin: 0 0 16px; padding-left: 2em; }
.markdown-body li { margin-top: 0.25em; }
.markdown-body table { border-spacing: 0; border-collapse: collapse; width: 100%; margin: 0 0 16px; }
.markdown-body table th { font-weight: 600; padding: 6px 13px; border: 1px solid #30363d; background: #161b22; }
.markdown-body table td { padding: 6px 13px; border: 1px solid #30363d; }
.markdown-body code { padding: 0.2em 0.4em; font-size: 85%; background: rgba(110,118,129,0.4); border-radius: 6px; font-family: ui-monospace, SFMono-Regular, monospace; }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; background: #1c2333; border-radius: 6px; margin: 0 0 16px; border: 1px solid #30363d; }
.markdown-body pre code { padding: 0; background: transparent; display: block; }
.markdown-body blockquote { padding: 0 1em; color: #8b949e; border-left: 0.25em solid #30363d; margin: 0 0 16px; }
.markdown-body a { color: #58a6ff; text-decoration: none; }
.markdown-body strong { font-weight: 600; }
.markdown-body hr { height: 0.25em; margin: 24px 0; background: #30363d; border: 0; }
.markdown-body img { max-width: 100%; }
.markdown-body ul:has(> li > input[type="checkbox"]) { list-style: none; padding-left: 0; }
.markdown-body li:has(> input[type="checkbox"]) { display: flex; align-items: baseline; gap: 0.5em; }
.markdown-body li > input[type="checkbox"] { margin-top: 0.125em; flex-shrink: 0; }
@media print {
  body { background: #fff !important; color: #24292f !important; }
  .markdown-body { max-width: 100%; padding: 0; color: #24292f !important; }
  .markdown-body * { color: #24292f !important; }
  @page { margin: 2cm; }
}
`,
};

const SHIKI_EXPORT_CSS = `
.shiki { padding: 16px; overflow: auto; font-size: 85%; line-height: 1.45; border-radius: 6px; margin: 0 0 16px; border: 1px solid; }
.shiki code { font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace; }
.shiki, .shiki span { color: var(--shiki-light); background: var(--shiki-light-bg); border-color: #d0d7de; }
@media (prefers-color-scheme: dark) {
  .shiki, .shiki span { color: var(--shiki-dark); background: var(--shiki-dark-bg); border-color: #30363d; }
}
@media print {
  .shiki, .shiki span { color: var(--shiki-light) !important; background: var(--shiki-light-bg) !important; }
}
`;

const KATEX_CSS = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.40/dist/katex.min.css" integrity="sha384-vKruj+a13U8yHIkAyGgK1J3ArTLzrFGBbBc0tDp4ad/EyewESeXE/Iv67Aj8gKZ0" crossorigin="anonymous">`;

const MERMAID_SCRIPT = `<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
</script>`;

function toRawUrl(url: string): string {
  const ghBlob = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)/);
  if (ghBlob)
    return `https://raw.githubusercontent.com/${ghBlob[1]}/${ghBlob[2]}/${ghBlob[3]}`;
  const gist = url.match(/gist\.github\.com\/([^/]+)\/([a-f0-9]+)$/);
  if (gist)
    return `https://gist.githubusercontent.com/${gist[1]}/${gist[2]}/raw`;
  return url;
}

function formatDate(d: unknown): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(String(d));
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function relativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function readDocuments(): SavedDocument[] {
  try {
    const raw = localStorage.getItem("md-documents");
    if (raw) return JSON.parse(raw);
  } catch {
    // no-op
  }
  return [];
}

function writeDocuments(docs: SavedDocument[]) {
  localStorage.setItem("md-documents", JSON.stringify(docs));
}

function extractTitleFromContent(raw: string): string {
  try {
    const { data, content } = matter(raw);
    if (data.title) return String(data.title);
    const match = content.match(/^#\s+(.+)/m);
    if (match) return match[1];
  } catch {
    const match = raw.match(/^#\s+(.+)/m);
    if (match) return match[1];
  }
  return "Untitled";
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countChars(text: string): number {
  return text.length;
}

function countLines(text: string): number {
  return text.split("\n").length;
}

function extractToc(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split("\n");
  
  lines.forEach((line) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      headings.push({ id, text, level });
    }
  });
  
  return headings;
}

export default function MarkdownConverter() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [dark, setDark] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [showFrontmatter, setShowFrontmatter] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [themeUrl, setThemeUrl] = useState("");
  const [showThemeInput, setShowThemeInput] = useState(false);
  const [themeLoading, setThemeLoading] = useState(false);
  const [activeThemeName, setActiveThemeName] = useState("");
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [showDocSheet, setShowDocSheet] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [scrollSync, setScrollSync] = useState(true);
  const [shareSuccess, setShareSuccess] = useState(false);

  const highlighterRef = useRef<Highlighter | null>(null);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingFromEditor = useRef(false);
  const isScrollingFromPreview = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let frontmatterData: Record<string, any> | null = null;
  let markdownContent = input;
  try {
    const { data, content } = matter(input);
    if (Object.keys(data).length > 0) frontmatterData = data;
    markdownContent = content;
  } catch {
    // no-op
  }

  const toc = extractToc(markdownContent);
  const wordCount = countWords(input);
  const charCount = countChars(input);
  const lineCount = countLines(input);

  const renderMermaid = useCallback(async (html: string): Promise<string> => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    
    const mermaidBlocks = tempDiv.querySelectorAll('pre code.language-mermaid');
    
    for (let i = 0; i < mermaidBlocks.length; i++) {
      const block = mermaidBlocks[i];
      const code = block.textContent || '';
      
      try {
        const { svg } = await mermaid.render(`mermaid-${Date.now()}-${i}`, code);
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-diagram';
        wrapper.innerHTML = svg;
        block.parentElement?.replaceWith(wrapper);
      } catch (err) {
        console.error('Mermaid render error:', err);
        // Keep the original code block on error
      }
    }
    
    return tempDiv.innerHTML;
  }, []);

  const renderMath = useCallback((html: string): string => {
    // Replace block math $$...$$
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, tex) => {
      try {
        return katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false });
      } catch {
        return match;
      }
    });
    
    // Replace inline math $...$
    html = html.replace(/\$([^$\n]+?)\$/g, (match, tex) => {
      try {
        return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
      } catch {
        return match;
      }
    });
    
    return html;
  }, []);

  const renderMarkdown = useCallback(async (content: string) => {
    if (!content) {
      setRenderedHtml("");
      return;
    }
    
    let html = await marked.parse(content);
    
    // Apply syntax highlighting
    const hl = highlighterRef.current;
    if (hl) {
      html = html.replace(
        /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
        (_: string, lang: string, code: string) => {
          if (lang === 'mermaid') {
            // Skip mermaid blocks for now, will handle separately
            return `<pre><code class="language-mermaid">${code}</code></pre>`;
          }
          const decoded = code
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
          try {
            return hl.codeToHtml(decoded, {
              lang: lang || "text",
              themes: { light: "github-light", dark: "github-dark" },
            });
          } catch {
            return `<pre><code class="language-${lang}">${code}</code></pre>`;
          }
        },
      );
    }
    
    // Apply math rendering
    html = renderMath(html);
    
    // Apply mermaid rendering
    html = await renderMermaid(html);
    
    // Add IDs to headings for TOC links
    html = html.replace(/<h([1-6])>(.+?)<\/h\1>/g, (match, level, text) => {
      const plainText = text.replace(/<[^>]+>/g, '');
      const id = plainText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      return `<h${level} id="${id}">${text}</h${level}>`;
    });
    
    setRenderedHtml(html);
  }, [renderMath, renderMermaid]);

  useEffect(() => {
    if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    renderTimerRef.current = setTimeout(() => {
      renderMarkdown(markdownContent);
    }, 50);
    return () => {
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    };
  }, [markdownContent, renderMarkdown]);

  // Auto-save debounce
  useEffect(() => {
    if (!autoSave || !activeDocId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveCurrentDocument();
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, autoSave, activeDocId]);

  // Initialize on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setDark(stored === "dark");
    } else {
      setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    // Initialize mermaid
    mermaid.initialize({ startOnLoad: false, theme: 'neutral' });

    // Load documents with legacy migration
    let docs = readDocuments();
    let docId = localStorage.getItem("md-active-doc-id");

    if (docs.length === 0) {
      const legacyContent = localStorage.getItem("md-content");
      const newDoc: SavedDocument = {
        id: crypto.randomUUID(),
        title: legacyContent
          ? extractTitleFromContent(legacyContent)
          : "Untitled",
        content: legacyContent || "",
        updatedAt: Date.now(),
      };
      docs = [newDoc];
      docId = newDoc.id;
      writeDocuments(docs);
      localStorage.setItem("md-active-doc-id", docId);
      localStorage.removeItem("md-content");
    }

    setDocuments(docs);

    if (docId && docs.find((d) => d.id === docId)) {
      setActiveDocId(docId);
      const doc = docs.find((d) => d.id === docId)!;
      setInput(doc.content);
    } else if (docs.length > 0) {
      setActiveDocId(docs[0].id);
      setInput(docs[0].content);
      localStorage.setItem("md-active-doc-id", docs[0].id);
    }

    const savedAutoSave = localStorage.getItem("md-autosave");
    if (savedAutoSave === "true") setAutoSave(true);

    const savedScrollSync = localStorage.getItem("md-scroll-sync");
    if (savedScrollSync === "false") setScrollSync(false);

    const savedThemeName = localStorage.getItem("md-theme-name");
    if (savedThemeName) setActiveThemeName(savedThemeName);

    const savedLightVars = localStorage.getItem("md-theme-light-vars");
    const savedDarkVars = localStorage.getItem("md-theme-dark-vars");
    if (savedLightVars || savedDarkVars) {
      applyThemeVars(
        savedLightVars ? JSON.parse(savedLightVars) : {},
        savedDarkVars ? JSON.parse(savedDarkVars) : {},
      );
    }

    createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: SHIKI_LANGS,
    }).then((h) => {
      highlighterRef.current = h;
    });

    // Check for shared document in URL hash
    const hash = window.location.hash;
    if (hash.startsWith('#doc=')) {
      try {
        const compressed = hash.slice(5); // Remove '#doc='
        const decompressed = decompressFromEncodedURIComponent(compressed);
        if (decompressed) {
          setInput(decompressed);
          // Clear hash from URL after loading
          window.history.replaceState(null, '', window.location.pathname);
          toast("Loaded shared document");
        }
      } catch (err) {
        console.error('Failed to load shared document:', err);
        toast.error("Failed to load shared document");
      }
    }

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        setDark(e.matches);
      }
    };
    mql.addEventListener("change", handler);
    setMounted(true);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      
      // Cmd/Ctrl+S - Save
      if (isMod && e.key === "s") {
        e.preventDefault();
        saveCurrentDocument();
        toast("Saved to browser");
      }
      
      // Cmd/Ctrl+Shift+C - Copy HTML
      if (isMod && e.shiftKey && e.key === "C") {
        e.preventDefault();
        copyHTML();
      }
      
      // Cmd/Ctrl+Shift+S - Share
      if (isMod && e.shiftKey && e.key === "S") {
        e.preventDefault();
        shareDocument();
      }
      
      // Cmd/Ctrl+K - Toggle URL import
      if (isMod && e.key === "k") {
        e.preventDefault();
        setShowUrlInput((prev) => !prev);
      }
      
      // Cmd/Ctrl+D - Download HTML
      if (isMod && e.key === "d") {
        e.preventDefault();
        downloadHTML();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, activeDocId, renderedHtml, dark]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (highlighterRef.current && markdownContent) {
      renderMarkdown(markdownContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlighterRef.current]);

  // Scroll sync
  useEffect(() => {
    if (!scrollSync) return;

    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    let editorTimeout: ReturnType<typeof setTimeout>;
    let previewTimeout: ReturnType<typeof setTimeout>;

    const handleEditorScroll = () => {
      if (isScrollingFromPreview.current) return;
      
      clearTimeout(editorTimeout);
      isScrollingFromEditor.current = true;
      
      const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      const targetScroll = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
      preview.scrollTop = targetScroll;
      
      editorTimeout = setTimeout(() => {
        isScrollingFromEditor.current = false;
      }, 100);
    };

    const handlePreviewScroll = () => {
      if (isScrollingFromEditor.current) return;
      
      clearTimeout(previewTimeout);
      isScrollingFromPreview.current = true;
      
      const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      const targetScroll = scrollPercentage * (editor.scrollHeight - editor.clientHeight);
      editor.scrollTop = targetScroll;
      
      previewTimeout = setTimeout(() => {
        isScrollingFromPreview.current = false;
      }, 100);
    };

    editor.addEventListener('scroll', handleEditorScroll);
    preview.addEventListener('scroll', handlePreviewScroll);

    return () => {
      editor.removeEventListener('scroll', handleEditorScroll);
      preview.removeEventListener('scroll', handlePreviewScroll);
      clearTimeout(editorTimeout);
      clearTimeout(previewTimeout);
    };
  }, [scrollSync]);

  // --- Document helpers ---

  function saveCurrentDocument() {
    if (!activeDocId) return;
    setDocuments((prev) => {
      const updated = prev.map((doc) =>
        doc.id === activeDocId
          ? {
              ...doc,
              content: input,
              title: extractTitleFromContent(input),
              updatedAt: Date.now(),
            }
          : doc,
      );
      writeDocuments(updated);
      return updated;
    });
  }

  function createNewDocument() {
    saveCurrentDocument();
    const newDoc: SavedDocument = {
      id: crypto.randomUUID(),
      title: "Untitled",
      content: "",
      updatedAt: Date.now(),
    };
    setDocuments((prev) => {
      const updated = [newDoc, ...prev];
      writeDocuments(updated);
      return updated;
    });
    setActiveDocId(newDoc.id);
    localStorage.setItem("md-active-doc-id", newDoc.id);
    setInput("");
    setShowDocSheet(false);
    toast("New document created");
  }

  function switchDocument(id: string) {
    if (id === activeDocId) {
      setShowDocSheet(false);
      return;
    }
    saveCurrentDocument();
    const doc = documents.find((d) => d.id === id);
    if (!doc) return;
    setActiveDocId(id);
    localStorage.setItem("md-active-doc-id", id);
    setInput(doc.content);
    setShowDocSheet(false);
  }

  function deleteDocument(id: string) {
    setDocuments((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      if (updated.length === 0) {
        const newDoc: SavedDocument = {
          id: crypto.randomUUID(),
          title: "Untitled",
          content: "",
          updatedAt: Date.now(),
        };
        const withNew = [newDoc];
        writeDocuments(withNew);
        setActiveDocId(newDoc.id);
        localStorage.setItem("md-active-doc-id", newDoc.id);
        setInput("");
        return withNew;
      }
      writeDocuments(updated);
      if (id === activeDocId) {
        const next = updated[0];
        setActiveDocId(next.id);
        localStorage.setItem("md-active-doc-id", next.id);
        setInput(next.content);
      }
      return updated;
    });
    toast("Document deleted");
  }

  // --- Other helpers ---

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }

  function toggleAutoSave() {
    const next = !autoSave;
    setAutoSave(next);
    localStorage.setItem("md-autosave", String(next));
    if (next) {
      saveCurrentDocument();
      toast("Auto-save enabled");
    } else {
      toast("Auto-save disabled");
    }
  }

  function toggleScrollSync() {
    const next = !scrollSync;
    setScrollSync(next);
    localStorage.setItem("md-scroll-sync", String(next));
    toast(next ? "Scroll sync enabled" : "Scroll sync disabled");
  }

  function saveNow() {
    saveCurrentDocument();
    toast("Saved to browser");
  }

  function extractTitle(): string {
    if (frontmatterData?.title) return String(frontmatterData.title);
    return (markdownContent.match(/^#\s+(.+)/m) || [])[1] || "Untitled";
  }

  function getFullHTML(): string {
    const currentTheme = GITHUB_THEME[dark ? "dark" : "light"];
    const hasMermaid = renderedHtml.includes('class="mermaid-diagram"');
    const hasMath = renderedHtml.includes('class="katex');
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${extractTitle()}</title>
${hasMath ? KATEX_CSS : ''}
<style>
${currentTheme}
${SHIKI_EXPORT_CSS}
@media print {
  body { background: #fff !important; color: #24292f !important; }
  .markdown-body { max-width: 100%; padding: 0; }
  .markdown-body * { color: inherit; }
  .no-print { display: none !important; }
}
</style>
</head>
<body>
<div class="markdown-body">
${renderedHtml}
</div>
${hasMermaid ? MERMAID_SCRIPT : ''}
</body>
</html>`;
  }

  function copyHTML() {
    navigator.clipboard
      .writeText(getFullHTML())
      .then(() => toast("HTML copied to clipboard"));
  }

  function downloadHTML() {
    const blob = new Blob([getFullHTML()], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "page.html";
    a.click();
    URL.revokeObjectURL(url);
    toast("Downloaded page.html");
  }

  function openPreview() {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(getFullHTML());
      w.document.close();
    }
  }

  function clearAll() {
    setInput("");
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    if (
      !file.name.endsWith(".md") &&
      !file.name.endsWith(".markdown") &&
      !file.name.endsWith(".txt") &&
      file.type !== "text/markdown" &&
      file.type !== "text/plain"
    ) {
      toast("Please drop a .md or .txt file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInput(ev.target?.result as string);
      toast(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  }

  async function fetchUrl() {
    const url = urlInput.trim();
    if (!url) return;
    setUrlLoading(true);
    try {
      const rawUrl = toRawUrl(url);
      const res = await fetch(rawUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setInput(text);
      setShowUrlInput(false);
      setUrlInput("");
      toast("Loaded from URL");
    } catch (err) {
      toast.error(`Failed to fetch: ${(err as Error).message}`);
    } finally {
      setUrlLoading(false);
    }
  }

  function applyThemeVars(
    lightVars: Record<string, string>,
    darkVars: Record<string, string>,
  ) {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(lightVars)) {
      root.style.setProperty(`--${key}`, value);
    }
    const existing = document.getElementById("md-theme-dark-override");
    if (existing) existing.remove();
    const declarations = Object.entries(darkVars)
      .map(([key, value]) => `--${key}: ${value};`)
      .join("\n  ");
    const style = document.createElement("style");
    style.id = "md-theme-dark-override";
    style.textContent = `.dark {\n  ${declarations}\n}`;
    document.head.appendChild(style);
  }

  async function applyThemeFromUrl() {
    const url = themeUrl.trim();
    if (!url) return;
    setThemeLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.cssVars)
        throw new Error("Invalid theme JSON — missing cssVars");

      const lightVars = json.cssVars.light || {};
      const darkVars = json.cssVars.dark || {};

      applyThemeVars(lightVars, darkVars);

      const name = json.name || "Custom";
      setActiveThemeName(name);
      localStorage.setItem("md-theme-url", url);
      localStorage.setItem("md-theme-name", name);
      localStorage.setItem("md-theme-light-vars", JSON.stringify(lightVars));
      localStorage.setItem("md-theme-dark-vars", JSON.stringify(darkVars));
      setShowThemeInput(false);
      setThemeUrl("");
      toast(`Theme "${name}" applied`);
    } catch (err) {
      toast.error(`Failed to load theme: ${(err as Error).message}`);
    } finally {
      setThemeLoading(false);
    }
  }

  function resetTheme() {
    document.documentElement.removeAttribute("style");
    const existing = document.getElementById("md-theme-dark-override");
    if (existing) existing.remove();
    document.documentElement.classList.toggle("dark", dark);
    setActiveThemeName("");
    localStorage.removeItem("md-theme-url");
    localStorage.removeItem("md-theme-name");
    localStorage.removeItem("md-theme-light-vars");
    localStorage.removeItem("md-theme-dark-vars");
    toast("Theme reset to default");
  }

  function scrollToHeading(id: string) {
    const preview = previewRef.current;
    if (!preview) return;
    
    const heading = preview.querySelector(`#${id}`);
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function shareDocument() {
    const content = input.trim();
    
    if (!content) {
      toast("Nothing to share");
      return;
    }
    
    try {
      // Compress the markdown content
      const compressed = compressToEncodedURIComponent(content);
      
      // Build the share URL
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      const shareUrl = `${baseUrl}#doc=${compressed}`;
      
      // Check size limits
      if (shareUrl.length > 12000) {
        toast.error("Content too large for URL sharing. Try shortening to under ~1,500 words.");
        return;
      }
      
      if (shareUrl.length > 8000) {
        toast("⚠️ Share link is large (~" + Math.floor(shareUrl.length / 1000) + "KB). May not work in all browsers.");
      }
      
      // Copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareSuccess(true);
        toast("Share link copied!");
        
        // Reset the success state after 2 seconds
        setTimeout(() => {
          setShareSuccess(false);
        }, 2000);
      }).catch(() => {
        toast.error("Failed to copy to clipboard");
      });
    } catch (err) {
      console.error('Share error:', err);
      toast.error("Failed to create share link");
    }
  }

  const activeDoc = documents.find((d) => d.id === activeDocId);

  if (!mounted) {
    return <div className="flex h-screen flex-col overflow-hidden" />;
  }

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <header className="relative border-b border-border/60 bg-linear-to-r from-primary/4 via-transparent to-accent/6 no-print">
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col gap-0.5">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                Markdown to HTML Converter
              </h1>
              <p className="text-[13px] leading-snug text-muted-foreground">
                Paste markdown, get styled HTML. Copy or download.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowShortcuts(true)}>
                    <HelpCircle className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Keyboard shortcuts</TooltipContent>
              </Tooltip>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/jcottam/markdown-to-html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    viewBox="0 0 16 16"
                    className="size-4 fill-current"
                    aria-label="GitHub"
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                </a>
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{dark ? "Light mode" : "Dark mode"}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Editor pane */}
          <div className="flex min-h-0 flex-1 flex-col border-b md:border-b-0 md:border-r">
            <div className="flex h-10 items-center justify-between border-b bg-muted text-muted-foreground px-4 no-print">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowDocSheet(true)}
                >
                  <FileText className="size-3" />
                  <span className="hidden sm:inline">
                    {activeDoc ? activeDoc.title : "Documents"}
                  </span>
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      onClick={shareDocument}
                      className="transition-all"
                    >
                      {shareSuccess ? (
                        <Check className="size-3 text-green-600" />
                      ) : (
                        <Share2 className="size-3" />
                      )}
                      <span className="hidden sm:inline">Share</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share ({modKey}+Shift+S)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="xs" onClick={saveNow}>
                      <Save className="size-3" />
                      <span className="hidden sm:inline">Save</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save ({modKey}+S)</TooltipContent>
                </Tooltip>
                <Button
                  variant={autoSave ? "default" : "ghost"}
                  size="xs"
                  onClick={toggleAutoSave}
                >
                  <Save className="size-3" />
                  <span className="hidden sm:inline">
                    {autoSave ? "Auto" : "Auto-save"}
                  </span>
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(input)
                          .then(() => toast("Markdown copied to clipboard"));
                      }}
                    >
                      <Copy className="size-3" />
                      <span className="hidden sm:inline">Copy MD</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy raw markdown</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        const title = extractTitle().replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "document";
                        const blob = new Blob([input], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${title}.md`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast(`Downloaded ${title}.md`);
                      }}
                    >
                      <Download className="size-3" />
                      <span className="hidden sm:inline">Download MD</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download as .md file</TooltipContent>
                </Tooltip>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="xs">
                      <Trash2 className="size-3" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear document?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will erase all content in the current document. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={clearAll}
                      >
                        Clear
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            
            {/* Word/Char/Line count bar */}
            <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground no-print">
              <span>{wordCount} words</span>
              <span>·</span>
              <span>{charCount} chars</span>
              <span>·</span>
              <span>{lineCount} lines</span>
            </div>
            
            <div
              className="relative min-h-0 flex-1"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <textarea
                ref={editorRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`# Hello World\n\nStart typing your markdown here...\n\n\`\`\`javascript\nfunction hello() {\n  console.log('Syntax highlighting!');\n}\n\`\`\``}
                className="h-full w-full resize-none overflow-y-auto bg-transparent p-4 font-mono text-sm outline-none placeholder:text-muted-foreground/50"
                spellCheck={false}
              />
              {dragging && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
                  <p className="text-lg font-medium text-primary">
                    Drop .md file here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview pane */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-10 items-center justify-between border-b bg-muted text-muted-foreground px-4 no-print">
              <div className="flex items-center gap-2">
                <Eye className="size-3.5" />
                <span className="text-sm font-medium">Preview</span>
              </div>
              <div className="flex items-center gap-1">
                {toc.length >= 2 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={showToc ? "default" : "ghost"}
                        size="xs"
                        onClick={() => setShowToc(!showToc)}
                      >
                        <List className="size-3" />
                        <span className="hidden sm:inline">TOC</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Table of Contents</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={scrollSync ? "default" : "ghost"}
                      size="xs"
                      onClick={toggleScrollSync}
                    >
                      <ArrowUpDown className="size-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Scroll sync</TooltipContent>
                </Tooltip>
                {frontmatterData && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowFrontmatter(!showFrontmatter)}
                  >
                    Frontmatter {showFrontmatter ? "▾" : "▸"}
                  </Button>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="xs" onClick={copyHTML}>
                      <Copy className="size-3" />
                      <span className="hidden sm:inline">Copy HTML</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy HTML ({modKey}+Shift+C)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="xs" onClick={downloadHTML}>
                      <Download className="size-3" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download HTML ({modKey}+D)</TooltipContent>
                </Tooltip>
                <Button variant="ghost" size="xs" onClick={openPreview}>
                  <ExternalLink className="size-3" />
                  <span className="hidden sm:inline">Open Full Page</span>
                </Button>
              </div>
            </div>

            {/* Frontmatter card */}
            {frontmatterData && showFrontmatter && (
              <div className="border-b bg-muted/30 px-4 py-3 no-print">
                <div className="space-y-1.5">
                  {frontmatterData.title && (
                    <h2 className="text-base font-semibold">
                      {String(frontmatterData.title)}
                    </h2>
                  )}
                  {frontmatterData.author && (
                    <p className="text-sm">{String(frontmatterData.author)}</p>
                  )}
                  {(frontmatterData.pubDate || frontmatterData.date) && (
                    <p className="text-sm">
                      {formatDate(
                        frontmatterData.pubDate || frontmatterData.date,
                      )}
                    </p>
                  )}
                  {frontmatterData.description && (
                    <p className="text-sm text-muted-foreground">
                      {String(frontmatterData.description)}
                    </p>
                  )}
                  {Array.isArray(frontmatterData.tags) && (
                    <div className="flex flex-wrap gap-1">
                      {(frontmatterData.tags as string[]).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TOC */}
            {showToc && toc.length >= 2 && (
              <div className="border-b bg-muted/30 px-4 py-3 no-print">
                <h3 className="mb-2 text-sm font-semibold">Table of Contents</h3>
                <nav className="space-y-1">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className="block w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                      style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              </div>
            )}

            {/* HTML preview */}
            <div
              ref={previewRef}
              className="markdown-preview min-h-0 flex-1 overflow-y-auto p-4"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </div>

        {/* Footer toolbar */}
        <footer className="flex flex-wrap items-center gap-2 border-t px-4 py-2 sm:px-6 no-print">
          <Dialog
            open={showUrlInput}
            onOpenChange={(open: boolean) => {
              setShowUrlInput(open);
              if (!open) setUrlInput("");
            }}
          >
            <DialogTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Link className="size-3.5" />
                    Import
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Import from URL ({modKey}+K)</TooltipContent>
              </Tooltip>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Import from URL</DialogTitle>
                <DialogDescription>
                  Paste a GitHub file URL, Gist, or raw markdown URL.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://github.com/user/repo/blob/main/README.md"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchUrl();
                    }
                  }}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <DialogClose asChild>
                    <Button variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUrl}
                    disabled={urlLoading}
                  >
                    {urlLoading ? "Loading..." : "Fetch"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowThemeInput(!showThemeInput);
              if (showThemeInput) setThemeUrl("");
            }}
          >
            <Palette className="size-3.5" />
            Theme
          </Button>
          {activeThemeName && (
            <>
              <span className="text-xs text-muted-foreground">
                Active: {activeThemeName}
              </span>
              <Button variant="ghost" size="xs" onClick={resetTheme}>
                <X className="size-3" />
                Reset
              </Button>
            </>
          )}

          <div className="flex-1" />

          <span className="text-xs text-muted-foreground">
            Built by{" "}
            <a
              href="https://johnryancottam.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground hover:underline"
            >
              John Ryan Cottam
            </a>
          </span>
        </footer>

        {/* Theme input */}
        {showThemeInput && (
          <div className="flex items-center gap-2 border-t bg-muted/30 px-4 py-2 sm:px-6 no-print">
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://tweakcn.com/editor/theme"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-3.5" />
                Browse
              </a>
            </Button>
            <Input
              value={themeUrl}
              onChange={(e) => setThemeUrl(e.target.value)}
              placeholder="Paste theme JSON URL..."
              onKeyDown={(e) => e.key === "Enter" && applyThemeFromUrl()}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={applyThemeFromUrl}
              disabled={themeLoading}
            >
              {themeLoading ? "Loading..." : "Apply"}
            </Button>
            <Button variant="ghost" size="sm" onClick={resetTheme}>
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowThemeInput(false);
                setThemeUrl("");
              }}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        )}

        {/* Documents Sheet */}
        <Sheet open={showDocSheet} onOpenChange={setShowDocSheet}>
          <SheetContent side="left" className="flex flex-col">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>Documents</SheetTitle>
                <Button variant="outline" size="xs" onClick={createNewDocument}>
                  <Plus className="size-3" />
                  New
                </Button>
              </div>
              <SheetDescription>
                {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
                saved
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto -mx-2">
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <FileText className="size-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No documents yet
                  </p>
                  <Button variant="outline" size="sm" onClick={createNewDocument}>
                    <Plus className="size-3.5" />
                    Create your first document
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5 px-2">
                  {documents
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .map((doc) => (
                      <div
                        key={doc.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => switchDocument(doc.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            switchDocument(doc.id);
                          }
                        }}
                        className={`group flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors ${
                          doc.id === activeDocId
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {doc.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {relativeTime(doc.updatedAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPendingDeleteId(doc.id);
                          }}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Delete confirmation */}
        <AlertDialog
          open={pendingDeleteId !== null}
          onOpenChange={(open: boolean) => {
            if (!open) setPendingDeleteId(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete document?</AlertDialogTitle>
              <AlertDialogDescription>
                This document will be permanently deleted from your browser
                storage. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (pendingDeleteId) {
                    deleteDocument(pendingDeleteId);
                    setPendingDeleteId(null);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Keyboard shortcuts dialog */}
        <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
              <DialogDescription>
                Speed up your workflow with these shortcuts
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Save to browser</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+S
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Share document</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+Shift+S
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Copy HTML</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+Shift+C
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Toggle URL import</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+K
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Download HTML</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+D
                </kbd>
              </div>
            </div>
            <DialogClose asChild>
              <Button variant="outline" className="mt-2">
                Close
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

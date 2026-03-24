"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";
import matter from "gray-matter";
import { createHighlighter, type Highlighter } from "shiki";
import { toast } from "sonner";
import mermaid from "mermaid";
import katex from "katex";
// html2pdf will be dynamically imported on client-side only
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
  Save,
  Eye,
  FileText,
  Plus,
  List,
  HelpCircle,
  Info,
  ArrowUpDown,
  Columns,
  Edit,
  FileDown,
  Highlighter as HighlighterIcon,
} from "lucide-react";
import {
  THEMES,
  SHIKI_EXPORT_CSS,
  KATEX_CSS,
  MERMAID_SCRIPT,
  PDF_PRINT_CSS,
} from "@/lib/themes";
import { HighlightToolbar } from "@/components/highlight-toolbar";
import { HighlightsPanel } from "@/components/highlights-panel";
import { HighlightSummary } from "@/components/highlight-summary";
import {
  type Highlight,
  createTextFragment,
  saveHighlights,
  loadHighlights,
  clearHighlights,
  applyHighlightsToDOM,
} from "@/lib/highlight-utils";

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

type PaneLayout = "split" | "editor-only" | "preview-only";

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

function scopeThemeCSS(css: string): string {
  function scopeSelector(sel: string): string {
    sel = sel.trim();
    if (!sel) return sel;
    if (sel === "body") return ".markdown-preview";
    if (sel.startsWith(".markdown-body")) return `.markdown-preview ${sel}`;
    return `.markdown-preview ${sel}`;
  }

  return css.replace(
    /([^{}@][^{}]*?)(\{)/g,
    (_match, selectors: string, brace: string) => {
      const scoped = selectors.split(",").map(scopeSelector).join(", ");
      return scoped + brace;
    },
  );
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
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
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

  const [showFrontmatter, setShowFrontmatter] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [showDocSheet, setShowDocSheet] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [scrollSync, setScrollSync] = useState(true);

  // Feature 2: Themes
  const [selectedTheme, setSelectedTheme] = useState("github");

  // Feature 3: Pane layouts
  const [paneLayout, setPaneLayout] = useState<PaneLayout>("split");

  // Highlights system
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [showHighlightsPanel, setShowHighlightsPanel] = useState(false);
  const [highlightToolbar, setHighlightToolbar] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    selection: Selection | null;
  }>({ visible: false, position: { x: 0, y: 0 }, selection: null });

  const highlighterRef = useRef<Highlighter | null>(null);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const currentTheme = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];

  const renderMermaid = useCallback(async (html: string): Promise<string> => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const mermaidBlocks = tempDiv.querySelectorAll("pre code.language-mermaid");

    for (let i = 0; i < mermaidBlocks.length; i++) {
      const block = mermaidBlocks[i];
      const code = block.textContent || "";

      try {
        const { svg } = await mermaid.render(
          `mermaid-${Date.now()}-${i}`,
          code,
        );
        const wrapper = document.createElement("div");
        wrapper.className = "mermaid-diagram";
        wrapper.innerHTML = svg;
        block.parentElement?.replaceWith(wrapper);
      } catch (err) {
        console.error("Mermaid render error:", err);
        // Keep the original code block on error
      }
    }

    return tempDiv.innerHTML;
  }, []);

  const renderMath = useCallback((html: string): string => {
    // Replace block math $$...$$
    html = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, tex) => {
      try {
        return katex.renderToString(tex.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return match;
      }
    });

    // Replace inline math $...$
    html = html.replace(/\$([^$\n]+?)\$/g, (match, tex) => {
      try {
        return katex.renderToString(tex.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return match;
      }
    });

    return html;
  }, []);

  const renderMarkdown = useCallback(
    async (content: string) => {
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
            if (lang === "mermaid") {
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
        const plainText = text.replace(/<[^>]+>/g, "");
        const id = plainText
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");
        return `<h${level} id="${id}">${text}</h${level}>`;
      });

      setRenderedHtml(html);
    },
    [renderMath, renderMermaid],
  );

  useEffect(() => {
    if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    renderTimerRef.current = setTimeout(() => {
      renderMarkdown(markdownContent);
    }, 50);
    return () => {
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
    };
  }, [markdownContent, renderMarkdown]);

  // Initialize on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setDark(stored === "dark");
    } else {
      setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }

    // Initialize mermaid
    mermaid.initialize({ startOnLoad: false, theme: "neutral" });

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

    const savedScrollSync = localStorage.getItem("md-scroll-sync");
    if (savedScrollSync === "false") setScrollSync(false);

    // Feature 2: Load selected theme
    const savedTheme = localStorage.getItem("md-selected-theme");
    if (savedTheme && THEMES.find((t) => t.id === savedTheme)) {
      setSelectedTheme(savedTheme);
    }

    // Feature 3: Load pane layout
    const savedLayout = localStorage.getItem("md-pane-layout");
    if (
      savedLayout &&
      ["split", "editor-only", "preview-only"].includes(savedLayout)
    ) {
      setPaneLayout(savedLayout as PaneLayout);
    }

    createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: SHIKI_LANGS,
    }).then((h) => {
      highlighterRef.current = h;
    });

    // Load highlights from localStorage
    const savedHighlights = loadHighlights();
    if (savedHighlights.length > 0) {
      setHighlights(savedHighlights);
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

  // Apply highlights to rendered HTML
  useEffect(() => {
    if (!previewRef.current || !renderedHtml) return;

    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      if (previewRef.current) {
        applyHighlightsToDOM(previewRef.current, highlights);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [renderedHtml, highlights]);

  // Save highlights to localStorage when they change
  useEffect(() => {
    if (mounted) {
      saveHighlights(highlights);
    }
  }, [highlights, mounted]);

  // Handle text selection in preview for highlight toolbar
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    function handleSelectionChange() {
      if (!preview) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setHighlightToolbar({
          visible: false,
          position: { x: 0, y: 0 },
          selection: null,
        });
        return;
      }

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;

      // Check if selection is within preview
      const isInPreview = preview.contains(
        container.nodeType === Node.TEXT_NODE
          ? container.parentNode
          : container,
      );
      if (!isInPreview) {
        setHighlightToolbar({
          visible: false,
          position: { x: 0, y: 0 },
          selection: null,
        });
        return;
      }

      // Don't show toolbar if selecting within existing highlight or toolbar
      const parentElement =
        container.nodeType === Node.TEXT_NODE
          ? container.parentElement
          : (container as HTMLElement);
      if (
        parentElement?.closest(
          ".highlight-mark, .highlight-toolbar, .highlight-summary",
        )
      ) {
        return;
      }

      const rect = range.getBoundingClientRect();
      const previewRect = preview.getBoundingClientRect();

      // Position toolbar above selection (or below if not enough space)
      const toolbarHeight = 50;
      const spaceAbove = rect.top - previewRect.top;
      const spaceBelow = previewRect.bottom - rect.bottom;

      let y = rect.top + window.scrollY - toolbarHeight - 8;
      if (spaceAbove < toolbarHeight + 16 && spaceBelow > toolbarHeight + 16) {
        y = rect.bottom + window.scrollY + 8;
      }

      const x = rect.left + rect.width / 2 - 100; // Center toolbar

      setHighlightToolbar({
        visible: true,
        position: { x, y },
        selection,
      });
    }

    function handleMouseUp() {
      // Delay to allow selection to complete
      setTimeout(handleSelectionChange, 10);
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".highlight-toolbar")) {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          // Selection still active, keep toolbar
          return;
        }
        setHighlightToolbar({
          visible: false,
          position: { x: 0, y: 0 },
          selection: null,
        });
      }
    }

    preview.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      preview.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle clicks on existing highlights to remove them
  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    function handleHighlightClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const highlightMark = target.closest(".highlight-mark") as HTMLElement;

      if (highlightMark) {
        const highlightId = highlightMark.dataset.highlightId;
        if (highlightId) {
          // Show confirmation or just remove
          if (confirm("Remove this highlight?")) {
            removeHighlight(highlightId);
          }
        }
      }
    }

    preview.addEventListener("click", handleHighlightClick);
    return () => preview.removeEventListener("click", handleHighlightClick);
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

      // Cmd/Ctrl+D - Download HTML
      if (isMod && e.key === "d") {
        e.preventDefault();
        downloadHTML();
      }

      // Feature 1: Cmd/Ctrl+Shift+D - Download PDF
      if (isMod && e.shiftKey && e.key === "D") {
        e.preventDefault();
        downloadPDF();
      }

      // Feature 3: Cmd/Ctrl+1/2/3 - Pane layouts
      if (isMod && e.key === "1") {
        e.preventDefault();
        changePaneLayout("split");
      }
      if (isMod && e.key === "2") {
        e.preventDefault();
        changePaneLayout("editor-only");
      }
      if (isMod && e.key === "3") {
        e.preventDefault();
        changePaneLayout("preview-only");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, activeDocId, renderedHtml, dark, selectedTheme, paneLayout]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    if (highlighterRef.current && markdownContent) {
      renderMarkdown(markdownContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlighterRef.current]);

  // Scroll sync — depends on paneLayout and mounted so listeners
  // attach after the editor/preview DOM nodes actually exist.
  useEffect(() => {
    if (!scrollSync || !mounted) return;

    const editor = editorRef.current;
    const preview = previewRef.current;
    if (!editor || !preview) return;

    let editorTimeout: ReturnType<typeof setTimeout>;
    let previewTimeout: ReturnType<typeof setTimeout>;

    const handleEditorScroll = () => {
      if (isScrollingFromPreview.current) return;

      clearTimeout(editorTimeout);
      isScrollingFromEditor.current = true;

      const scrollPercentage =
        editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      const targetScroll =
        scrollPercentage * (preview.scrollHeight - preview.clientHeight);
      preview.scrollTop = targetScroll;

      editorTimeout = setTimeout(() => {
        isScrollingFromEditor.current = false;
      }, 100);
    };

    const handlePreviewScroll = () => {
      if (isScrollingFromEditor.current) return;

      clearTimeout(previewTimeout);
      isScrollingFromPreview.current = true;

      const scrollPercentage =
        preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      const targetScroll =
        scrollPercentage * (editor.scrollHeight - editor.clientHeight);
      editor.scrollTop = targetScroll;

      previewTimeout = setTimeout(() => {
        isScrollingFromPreview.current = false;
      }, 100);
    };

    editor.addEventListener("scroll", handleEditorScroll);
    preview.addEventListener("scroll", handlePreviewScroll);

    return () => {
      editor.removeEventListener("scroll", handleEditorScroll);
      preview.removeEventListener("scroll", handlePreviewScroll);
      clearTimeout(editorTimeout);
      clearTimeout(previewTimeout);
    };
  }, [scrollSync, mounted, paneLayout]);

  // --- Document helpers ---

  function saveCurrentDocument() {
    if (!activeDocId) return;
    setDocuments((prev) => {
      const existing = prev.find((d) => d.id === activeDocId);
      if (existing && existing.content === input) {
        return prev;
      }
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

  // --- Highlight helpers ---

  function addHighlight(type: Highlight["type"]) {
    const selection = highlightToolbar.selection;
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    // Get selection position in the full rendered text
    const range = selection.getRangeAt(0);
    const preClone = previewRef.current?.cloneNode(true) as HTMLElement;
    if (!preClone) return;

    // Get full text content
    const fullText = preClone.textContent || "";

    // Find approximate position (this is a simplified approach)
    // For production, you'd want more robust text location
    const beforeRange = range.cloneRange();
    beforeRange.selectNodeContents(previewRef.current!);
    beforeRange.setEnd(range.startContainer, range.startOffset);
    const selectionStart = beforeRange.toString().length;

    const textFragment = createTextFragment(
      fullText,
      selectedText,
      selectionStart,
    );

    const newHighlight: Highlight = {
      id: crypto.randomUUID(),
      type,
      selectedText,
      textFragment,
      createdAt: Date.now(),
    };

    setHighlights((prev) => [...prev, newHighlight]);

    // Clear selection and toolbar
    selection.removeAllRanges();
    setHighlightToolbar({
      visible: false,
      position: { x: 0, y: 0 },
      selection: null,
    });

    toast(`Added ${type} highlight`);
  }

  function removeHighlight(id: string) {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
    toast("Highlight removed");
  }

  function clearAllHighlights() {
    if (highlights.length === 0) return;

    if (confirm(`Remove all ${highlights.length} highlights?`)) {
      setHighlights([]);
      clearHighlights();
      toast("All highlights cleared");
    }
  }

  function scrollToHighlight(id: string) {
    const preview = previewRef.current;
    if (!preview) return;

    const mark = preview.querySelector(`[data-highlight-id="${id}"]`);
    if (mark) {
      mark.scrollIntoView({ behavior: "smooth", block: "center" });

      // Flash effect
      mark.classList.add("ring-2", "ring-primary");
      setTimeout(() => {
        mark.classList.remove("ring-2", "ring-primary");
      }, 1500);
    }
  }

  // --- Other helpers ---

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
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
    const currentThemeCSS = currentTheme[dark ? "dark" : "light"];
    const hasMermaid = renderedHtml.includes('class="mermaid-diagram"');
    const hasMath = renderedHtml.includes('class="katex');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${extractTitle()}</title>
${hasMath ? KATEX_CSS : ""}
<style>
${currentThemeCSS}
${SHIKI_EXPORT_CSS}
${PDF_PRINT_CSS}
</style>
</head>
<body>
<div class="markdown-body">
${renderedHtml}
</div>
${hasMermaid ? MERMAID_SCRIPT : ""}
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
    a.download = `${
      extractTitle()
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim() || "document"
    }.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Downloaded ${extractTitle()}.html`);
  }

  // Feature 1: PDF Export
  async function downloadPDF() {
    const title =
      extractTitle()
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim() || "document";

    // Detect iOS/mobile — html2pdf.js struggles on iOS Safari due to html2canvas limitations
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isMobile = isIOS || /Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile fallback: open full page view and trigger print dialog (Save as PDF)
      toast("Opening print view — use 'Save as PDF' in the print dialog");
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(getFullHTML());
        w.document.close();
        setTimeout(() => w.print(), 500);
      } else {
        toast.error("Pop-up blocked — allow pop-ups and try again");
      }
      return;
    }

    const element = document.createElement("div");
    element.innerHTML = `<div class="markdown-body">${renderedHtml}</div>`;

    // Inject theme styles
    const style = document.createElement("style");
    style.textContent = currentTheme[dark ? "dark" : "light"];
    element.insertBefore(style, element.firstChild);

    const opt = {
      margin: 15,
      filename: `${title}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    toast("Generating PDF...");

    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import("html2pdf.js")).default;

      await html2pdf().set(opt).from(element).save();

      toast(`Downloaded ${title}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
      // Fallback to print dialog on desktop too
      toast("PDF generation failed — opening print view instead");
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(getFullHTML());
        w.document.close();
        setTimeout(() => w.print(), 500);
      }
    }
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
    setHighlights([]);
    clearHighlights();
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

  function scrollToHeading(id: string) {
    const preview = previewRef.current;
    if (!preview) return;

    const heading = preview.querySelector(`#${CSS.escape(id)}`);
    if (heading) {
      const headingTop = (heading as HTMLElement).offsetTop;
      preview.scrollTo({ top: headingTop, behavior: "smooth" });
    }
  }

  // Feature 2: Theme selector
  function changeTheme(themeId: string) {
    setSelectedTheme(themeId);
    localStorage.setItem("md-selected-theme", themeId);
    const theme = THEMES.find((t) => t.id === themeId);
    if (theme) {
      toast(`Theme: ${theme.name}`);
    }
  }

  // Feature 3: Pane layout
  function changePaneLayout(layout: PaneLayout) {
    setPaneLayout(layout);
    localStorage.setItem("md-pane-layout", layout);
    const labels = {
      split: "Split view",
      "editor-only": "Editor only",
      "preview-only": "Preview only",
    };
    toast(labels[layout]);
  }

  const activeDoc = documents.find((d) => d.id === activeDocId);

  if (!mounted) {
    return <div className="flex h-screen flex-col overflow-hidden" />;
  }

  const isMac =
    typeof navigator !== "undefined" &&
    navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const showEditor = paneLayout === "split" || paneLayout === "editor-only";
  const showPreview = paneLayout === "split" || paneLayout === "preview-only";

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <header className="relative border-b border-border/60 bg-linear-to-r from-primary/4 via-transparent to-accent/6 no-print">
          <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col gap-0.5">
              <h1 className="flex items-center gap-1.5 text-xl font-bold font-mono tracking-tight sm:text-2xl">
                SPARK
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M9 4h6v8h4.84L12 19.84L4.16 12H9z"
                  />
                </svg>
              </h1>
              <p className="text-[13px] font-mono leading-snug text-muted-foreground">
                Write markdown. Preview, theme, and publish.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowShortcuts(true)}
                  >
                    <HelpCircle className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Keyboard shortcuts</TooltipContent>
              </Tooltip>
              <Button variant="ghost" size="icon" asChild>
                <a
                  href="https://github.com/jcottam/sparkdown"
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
                    {dark ? (
                      <Sun className="size-4" />
                    ) : (
                      <Moon className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {dark ? "Light mode" : "Dark mode"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Editor pane */}
          {showEditor && (
            <div
              className={`flex min-h-0 flex-col border-b md:border-b-0 md:border-r transition-all duration-300 ${
                paneLayout === "editor-only" ? "flex-1" : "flex-1"
              }`}
            >
              <div className="flex h-10 items-center justify-between border-b bg-muted text-muted-foreground px-2 no-print">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowDocSheet(true)}
                  >
                    <FileText className="size-3" />
                    Documents
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="xs" onClick={saveNow}>
                        <Save className="size-3" />
                        <span className="hidden sm:inline">Save</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Save ({modKey}+S)</TooltipContent>
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
                          This will erase all content in the current document.
                          This action cannot be undone.
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
                <span className="truncate font-medium text-foreground">
                  {extractTitle()}
                </span>
                <span>·</span>
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{charCount} chars</span>
                <span>·</span>
                <span>{lineCount} lines</span>
                <span className="ml-auto">
                  {activeDoc
                    ? `Updated ${relativeTime(activeDoc.updatedAt)}`
                    : ""}
                </span>
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
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      document.execCommand("insertText", false, "  ");
                    }
                  }}
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
          )}

          {/* Preview pane */}
          {showPreview && (
            <div
              className={`flex min-h-0 min-w-0 flex-col transition-all duration-300 ${
                paneLayout === "preview-only" ? "flex-1" : "flex-1"
              }`}
            >
              <div className="flex h-10 items-center justify-between border-b bg-muted text-muted-foreground px-4 no-print">
                <div className="flex items-center gap-2">
                  <Eye className="size-3.5" />
                  <span className="text-sm font-medium">Preview</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={showHighlightsPanel ? "default" : "ghost"}
                        size="xs"
                        onClick={() =>
                          setShowHighlightsPanel(!showHighlightsPanel)
                        }
                        className="relative"
                      >
                        <HighlighterIcon className="size-3" />
                        {highlights.length > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {highlights.length}
                          </span>
                        )}
                        <span className="hidden sm:inline">Highlights</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Highlights panel</TooltipContent>
                  </Tooltip>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="xs" onClick={copyHTML}>
                        <Copy className="size-3" />
                        <span className="hidden sm:inline">Copy HTML</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Copy HTML ({modKey}+Shift+C)
                    </TooltipContent>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="xs" onClick={downloadPDF}>
                        <FileDown className="size-3" />
                        <span className="hidden sm:inline">PDF</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      Download PDF ({modKey}+Shift+D)
                    </TooltipContent>
                  </Tooltip>
                  <Button variant="ghost" size="xs" onClick={openPreview}>
                    <ExternalLink className="size-3" />
                    <span className="hidden sm:inline">Open Full Page</span>
                  </Button>
                </div>
              </div>

              {/* Preview subnav */}
              <div className="flex items-center gap-3 border-b bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground no-print">
                <Select value={selectedTheme} onValueChange={changeTheme}>
                  <SelectTrigger className="h-6 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map((theme) => (
                      <SelectItem
                        key={theme.id}
                        value={theme.id}
                        className="text-xs"
                      >
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="ml-auto flex items-center gap-3">
                  {frontmatterData && (
                    <button
                      onClick={() => setShowFrontmatter(true)}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Info className="size-3" />
                      Details
                    </button>
                  )}
                  {toc.length >= 2 && (
                    <>
                      {frontmatterData && <span>·</span>}
                      <button
                        onClick={() => setShowToc(true)}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        <List className="size-3" />
                        Table of Contents
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Frontmatter dialog */}
              <Dialog open={showFrontmatter} onOpenChange={setShowFrontmatter}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {frontmatterData?.title
                        ? String(frontmatterData.title)
                        : "Document Details"}
                    </DialogTitle>
                    {frontmatterData?.description && (
                      <DialogDescription>
                        {String(frontmatterData.description)}
                      </DialogDescription>
                    )}
                  </DialogHeader>
                  {frontmatterData && (
                    <div className="space-y-3">
                      {frontmatterData.author && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-muted-foreground">
                            Author
                          </span>
                          <span>{String(frontmatterData.author)}</span>
                        </div>
                      )}
                      {(frontmatterData.pubDate || frontmatterData.date) && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-muted-foreground">
                            Date
                          </span>
                          <span>
                            {formatDate(
                              frontmatterData.pubDate || frontmatterData.date,
                            )}
                          </span>
                        </div>
                      )}
                      {Array.isArray(frontmatterData.tags) && (
                        <div className="space-y-1.5">
                          <span className="text-sm font-medium text-muted-foreground">
                            Tags
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(frontmatterData.tags as string[]).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {Object.entries(frontmatterData)
                        .filter(
                          ([key]) =>
                            !["title", "author", "pubDate", "date", "description", "tags"].includes(key),
                        )
                        .map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-muted-foreground capitalize">
                              {key}
                            </span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                    </div>
                  )}
                  <DialogClose asChild>
                    <Button variant="outline" className="mt-2">
                      Close
                    </Button>
                  </DialogClose>
                </DialogContent>
              </Dialog>

              {/* HTML preview */}
              <div
                ref={previewRef}
                className="markdown-preview min-h-0 flex-1 overflow-y-auto overflow-x-hidden wrap-break-word p-4"
              >
                {/* Highlight Summary */}
                <HighlightSummary highlights={highlights} />

                {/* Rendered content */}
                <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
              </div>

              {/* Inject theme CSS scoped to preview pane */}
              <style
                dangerouslySetInnerHTML={{
                  __html: scopeThemeCSS(currentTheme[dark ? "dark" : "light"]),
                }}
              />
            </div>
          )}
        </div>

        {/* Footer toolbar */}
        <footer className="flex flex-wrap items-center gap-2 border-t px-4 py-2 sm:px-6 no-print">
          {/* Feature 3: Pane layout controls */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={paneLayout === "split" ? "default" : "ghost"}
                  size="xs"
                  onClick={() => changePaneLayout("split")}
                >
                  <Columns className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Split ({modKey}+1)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={paneLayout === "editor-only" ? "default" : "ghost"}
                  size="xs"
                  onClick={() => changePaneLayout("editor-only")}
                >
                  <Edit className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editor only ({modKey}+2)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={paneLayout === "preview-only" ? "default" : "ghost"}
                  size="xs"
                  onClick={() => changePaneLayout("preview-only")}
                >
                  <Eye className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview only ({modKey}+3)</TooltipContent>
            </Tooltip>
          </div>

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

        {/* TOC Sheet */}
        <Sheet open={showToc} onOpenChange={setShowToc}>
          <SheetContent side="right" className="flex flex-col">
            <SheetHeader>
              <SheetTitle>Table of Contents</SheetTitle>
              <SheetDescription>
                {toc.length} heading{toc.length !== 1 ? "s" : ""}
              </SheetDescription>
            </SheetHeader>
            <nav className="flex-1 overflow-y-auto -mx-2 px-2 space-y-0.5">
              {toc.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToHeading(item.id);
                    setShowToc(false);
                  }}
                  className="block w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
                >
                  {item.text}
                </button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={createNewDocument}
                  >
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
                <span>Copy HTML</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+Shift+C
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Download HTML</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+D
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Download PDF</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+Shift+D
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Split view</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+1
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Editor only</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+2
                </kbd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Preview only</span>
                <kbd className="rounded bg-muted px-2 py-1 font-mono text-xs">
                  {modKey}+3
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

        {/* Highlight Toolbar */}
        {highlightToolbar.visible && (
          <HighlightToolbar
            position={highlightToolbar.position}
            onHighlight={addHighlight}
            onClose={() =>
              setHighlightToolbar({
                visible: false,
                position: { x: 0, y: 0 },
                selection: null,
              })
            }
          />
        )}

        {/* Highlights Panel */}
        <HighlightsPanel
          open={showHighlightsPanel}
          onOpenChange={setShowHighlightsPanel}
          highlights={highlights}
          onRemove={removeHighlight}
          onClearAll={clearAllHighlights}
          onScrollTo={scrollToHighlight}
        />
      </div>
    </TooltipProvider>
  );
}

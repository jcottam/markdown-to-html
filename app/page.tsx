import type { Metadata } from "next";
import MarkdownConverter from "@/components/markdown-converter";

export const metadata: Metadata = {
  title: "Sparkdown — Markdown Editor & Publisher",
  description:
    "Write markdown, preview styled HTML, export to PDF. Themes, syntax highlighting, diagrams, math, sharing. Browser-only: no server, no tracking.",
};

export default function Page() {
  return <MarkdownConverter />;
}

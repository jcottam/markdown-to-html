export type ThemeMode = "light" | "dark";

export interface Theme {
  name: string;
  id: string;
  light: string;
  dark: string;
}

export const THEMES: Theme[] = [
  {
    name: "GitHub",
    id: "github",
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
.markdown-body a:hover { text-decoration: underline; }
.markdown-body strong { font-weight: 600; }
.markdown-body hr { height: 0.25em; margin: 24px 0; background: #d0d7de; border: 0; }
.markdown-body img { max-width: 100%; }
.markdown-body ul:has(> li > input[type="checkbox"]) { list-style: none; padding-left: 0; }
.markdown-body li:has(> input[type="checkbox"]) { display: flex; align-items: baseline; gap: 0.5em; }
.markdown-body li > input[type="checkbox"] { margin-top: 0.125em; flex-shrink: 0; }
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
.markdown-body a:hover { text-decoration: underline; }
.markdown-body strong { font-weight: 600; }
.markdown-body hr { height: 0.25em; margin: 24px 0; background: #30363d; border: 0; }
.markdown-body img { max-width: 100%; }
.markdown-body ul:has(> li > input[type="checkbox"]) { list-style: none; padding-left: 0; }
.markdown-body li:has(> input[type="checkbox"]) { display: flex; align-items: baseline; gap: 0.5em; }
.markdown-body li > input[type="checkbox"] { margin-top: 0.125em; flex-shrink: 0; }
`,
  },
  {
    name: "Minimalist",
    id: "minimalist",
    light: `
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.8; color: #1a1a1a; background: #ffffff; }
.markdown-body { max-width: 680px; margin: 0 auto; padding: 60px 30px; }
@media (max-width: 767px) { .markdown-body { padding: 30px 20px; } }
.markdown-body h1 { font-size: 2.5em; margin: 48px 0 24px; font-weight: 300; letter-spacing: -0.02em; color: #111; }
.markdown-body h2 { font-size: 1.8em; margin: 40px 0 20px; font-weight: 400; color: #222; }
.markdown-body h3 { font-size: 1.4em; margin: 32px 0 16px; font-weight: 400; color: #333; }
.markdown-body h4 { font-size: 1.1em; margin: 24px 0 12px; font-weight: 500; color: #444; }
.markdown-body p { margin: 0 0 24px; color: #3a3a3a; }
.markdown-body ul, .markdown-body ol { margin: 0 0 24px; padding-left: 2em; }
.markdown-body li { margin-top: 8px; }
.markdown-body table { border-spacing: 0; border-collapse: collapse; width: 100%; margin: 0 0 24px; }
.markdown-body table th { font-weight: 500; padding: 12px 16px; border: 1px solid #e0e0e0; background: #fafafa; text-align: left; }
.markdown-body table td { padding: 12px 16px; border: 1px solid #e0e0e0; }
.markdown-body code { padding: 3px 6px; font-size: 0.9em; background: #f5f5f5; border-radius: 3px; font-family: "SF Mono", Monaco, monospace; color: #666; }
.markdown-body pre { padding: 20px; overflow: auto; font-size: 0.85em; line-height: 1.6; background: #f9f9f9; border-radius: 4px; margin: 0 0 24px; border: 1px solid #e8e8e8; }
.markdown-body pre code { padding: 0; background: transparent; display: block; color: #555; }
.markdown-body blockquote { padding: 0 24px; color: #666; border-left: 3px solid #ddd; margin: 0 0 24px; font-style: italic; }
.markdown-body a { color: #555; text-decoration: underline; text-decoration-color: #ccc; text-underline-offset: 3px; }
.markdown-body a:hover { text-decoration-color: #888; }
.markdown-body strong { font-weight: 500; }
.markdown-body hr { height: 1px; margin: 48px 0; background: #e5e5e5; border: 0; }
.markdown-body img { max-width: 100%; border-radius: 4px; }
`,
    dark: `
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 18px; line-height: 1.8; color: #e8e8e8; background: #0a0a0a; }
.markdown-body { max-width: 680px; margin: 0 auto; padding: 60px 30px; }
@media (max-width: 767px) { .markdown-body { padding: 30px 20px; } }
.markdown-body h1 { font-size: 2.5em; margin: 48px 0 24px; font-weight: 300; letter-spacing: -0.02em; color: #f0f0f0; }
.markdown-body h2 { font-size: 1.8em; margin: 40px 0 20px; font-weight: 400; color: #e8e8e8; }
.markdown-body h3 { font-size: 1.4em; margin: 32px 0 16px; font-weight: 400; color: #d8d8d8; }
.markdown-body h4 { font-size: 1.1em; margin: 24px 0 12px; font-weight: 500; color: #c8c8c8; }
.markdown-body p { margin: 0 0 24px; color: #b8b8b8; }
.markdown-body ul, .markdown-body ol { margin: 0 0 24px; padding-left: 2em; }
.markdown-body li { margin-top: 8px; }
.markdown-body table { border-spacing: 0; border-collapse: collapse; width: 100%; margin: 0 0 24px; }
.markdown-body table th { font-weight: 500; padding: 12px 16px; border: 1px solid #2a2a2a; background: #1a1a1a; text-align: left; }
.markdown-body table td { padding: 12px 16px; border: 1px solid #2a2a2a; }
.markdown-body code { padding: 3px 6px; font-size: 0.9em; background: #1a1a1a; border-radius: 3px; font-family: "SF Mono", Monaco, monospace; color: #999; }
.markdown-body pre { padding: 20px; overflow: auto; font-size: 0.85em; line-height: 1.6; background: #151515; border-radius: 4px; margin: 0 0 24px; border: 1px solid #252525; }
.markdown-body pre code { padding: 0; background: transparent; display: block; color: #aaa; }
.markdown-body blockquote { padding: 0 24px; color: #888; border-left: 3px solid #333; margin: 0 0 24px; font-style: italic; }
.markdown-body a { color: #aaa; text-decoration: underline; text-decoration-color: #444; text-underline-offset: 3px; }
.markdown-body a:hover { text-decoration-color: #777; }
.markdown-body strong { font-weight: 500; }
.markdown-body hr { height: 1px; margin: 48px 0; background: #2a2a2a; border: 0; }
.markdown-body img { max-width: 100%; border-radius: 4px; }
`,
  },
  {
    name: "Brutalist",
    id: "brutalist",
    light: `
body { font-family: 'Courier New', 'Courier', monospace; font-size: 16px; line-height: 1.4; color: #000; background: #fff; }
.markdown-body { max-width: 900px; margin: 0 auto; padding: 40px; }
@media (max-width: 767px) { .markdown-body { padding: 20px; } }
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
.markdown-body h1 { font-size: 2.5em; margin: 32px 0 16px; padding: 16px; border: 2px solid #000; background: #000; color: #fff; }
.markdown-body h2 { font-size: 2em; margin: 28px 0 14px; padding: 12px; border: 2px solid #000; }
.markdown-body h3 { font-size: 1.5em; margin: 24px 0 12px; padding: 8px; border: 2px solid #000; border-left: 8px solid #000; }
.markdown-body h4 { font-size: 1.2em; margin: 20px 0 10px; border-bottom: 2px solid #000; padding-bottom: 4px; }
.markdown-body p { margin: 0 0 16px; }
.markdown-body ul, .markdown-body ol { margin: 0 0 16px; padding-left: 2em; border-left: 2px solid #000; padding-left: 24px; }
.markdown-body li { margin-top: 8px; }
.markdown-body table { border: 2px solid #000; border-spacing: 0; border-collapse: separate; width: 100%; margin: 0 0 16px; }
.markdown-body table th { font-weight: 700; padding: 12px; border: 2px solid #000; background: #000; color: #fff; text-transform: uppercase; }
.markdown-body table td { padding: 12px; border: 2px solid #000; }
.markdown-body code { padding: 4px 8px; font-size: 0.9em; background: #000; color: #fff; font-family: 'Courier New', Courier, monospace; border: 2px solid #000; }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 14px; line-height: 1.4; background: #fff; margin: 0 0 16px; border: 2px solid #000; }
.markdown-body pre code { padding: 0; background: transparent; display: block; color: #000; border: none; }
.markdown-body blockquote { padding: 16px; color: #000; border: 2px solid #000; margin: 0 0 16px; background: #f0f0f0; }
.markdown-body a { color: #000; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 2px; }
.markdown-body a:hover { background: #000; color: #fff; }
.markdown-body strong { font-weight: 700; background: #000; color: #fff; padding: 0 4px; }
.markdown-body hr { height: 4px; margin: 32px 0; background: #000; border: 0; }
.markdown-body img { max-width: 100%; border: 2px solid #000; }
`,
    dark: `
body { font-family: 'Courier New', 'Courier', monospace; font-size: 16px; line-height: 1.4; color: #fff; background: #000; }
.markdown-body { max-width: 900px; margin: 0 auto; padding: 40px; }
@media (max-width: 767px) { .markdown-body { padding: 20px; } }
.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6 { text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
.markdown-body h1 { font-size: 2.5em; margin: 32px 0 16px; padding: 16px; border: 2px solid #fff; background: #fff; color: #000; }
.markdown-body h2 { font-size: 2em; margin: 28px 0 14px; padding: 12px; border: 2px solid #fff; }
.markdown-body h3 { font-size: 1.5em; margin: 24px 0 12px; padding: 8px; border: 2px solid #fff; border-left: 8px solid #fff; }
.markdown-body h4 { font-size: 1.2em; margin: 20px 0 10px; border-bottom: 2px solid #fff; padding-bottom: 4px; }
.markdown-body p { margin: 0 0 16px; }
.markdown-body ul, .markdown-body ol { margin: 0 0 16px; padding-left: 2em; border-left: 2px solid #fff; padding-left: 24px; }
.markdown-body li { margin-top: 8px; }
.markdown-body table { border: 2px solid #fff; border-spacing: 0; border-collapse: separate; width: 100%; margin: 0 0 16px; }
.markdown-body table th { font-weight: 700; padding: 12px; border: 2px solid #fff; background: #fff; color: #000; text-transform: uppercase; }
.markdown-body table td { padding: 12px; border: 2px solid #fff; }
.markdown-body code { padding: 4px 8px; font-size: 0.9em; background: #fff; color: #000; font-family: 'Courier New', Courier, monospace; border: 2px solid #fff; }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 14px; line-height: 1.4; background: #000; margin: 0 0 16px; border: 2px solid #fff; }
.markdown-body pre code { padding: 0; background: transparent; display: block; color: #fff; border: none; }
.markdown-body blockquote { padding: 16px; color: #fff; border: 2px solid #fff; margin: 0 0 16px; background: #1a1a1a; }
.markdown-body a { color: #fff; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 2px; }
.markdown-body a:hover { background: #fff; color: #000; }
.markdown-body strong { font-weight: 700; background: #fff; color: #000; padding: 0 4px; }
.markdown-body hr { height: 4px; margin: 32px 0; background: #fff; border: 0; }
.markdown-body img { max-width: 100%; border: 2px solid #fff; }
`,
  },
  {
    name: "Gen Z",
    id: "genz",
    light: `
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 16px; line-height: 1.6; color: #1a1a2e; background: linear-gradient(135deg, #fef9f3 0%, #faf4ff 100%); }
.markdown-body { max-width: 800px; margin: 0 auto; padding: 48px 32px; }
@media (max-width: 767px) { .markdown-body { padding: 24px 16px; } }
.markdown-body h1 { font-size: 2.5em; margin: 32px 0 20px; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.markdown-body h2 { font-size: 2em; margin: 28px 0 16px; font-weight: 600; color: #5856d6; }
.markdown-body h3 { font-size: 1.5em; margin: 24px 0 12px; font-weight: 600; color: #764ba2; }
.markdown-body h4 { font-size: 1.2em; margin: 20px 0 10px; font-weight: 600; color: #667eea; }
.markdown-body p { margin: 0 0 20px; color: #2d2d44; }
.markdown-body ul, .markdown-body ol { margin: 0 0 20px; padding-left: 2em; }
.markdown-body li { margin-top: 8px; }
.markdown-body table { border-spacing: 0; border-collapse: separate; border-radius: 1rem; overflow: hidden; width: 100%; margin: 0 0 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.markdown-body table th { font-weight: 600; padding: 14px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-align: left; }
.markdown-body table td { padding: 12px 16px; background: #fff; border-top: 1px solid #f0e6ff; }
.markdown-body code { padding: 4px 8px; font-size: 0.9em; background: #f0e6ff; border-radius: 0.5rem; font-family: 'SF Mono', 'Fira Code', monospace; color: #764ba2; }
.markdown-body pre { padding: 20px; overflow: auto; font-size: 14px; line-height: 1.6; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1rem; margin: 0 0 20px; }
.markdown-body pre code { padding: 0; background: transparent; display: block; color: #fff; }
.markdown-body blockquote { padding: 20px 24px; color: #5856d6; border-left: none; margin: 0 0 20px; background: #fff; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); position: relative; }
.markdown-body blockquote::before { content: '"'; position: absolute; left: 16px; top: 8px; font-size: 3em; color: #d0c5ff; font-family: Georgia, serif; }
.markdown-body a { color: #5856d6; text-decoration: none; border-bottom: 2px solid #d0c5ff; padding-bottom: 1px; transition: all 0.2s; }
.markdown-body a:hover { border-bottom-color: #5856d6; }
.markdown-body strong { font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.markdown-body hr { height: 2px; margin: 32px 0; background: linear-gradient(90deg, transparent, #d0c5ff, transparent); border: 0; }
.markdown-body img { max-width: 100%; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
`,
    dark: `
body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 16px; line-height: 1.6; color: #e8e6f0; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); }
.markdown-body { max-width: 800px; margin: 0 auto; padding: 48px 32px; }
@media (max-width: 767px) { .markdown-body { padding: 24px 16px; } }
.markdown-body h1 { font-size: 2.5em; margin: 32px 0 20px; font-weight: 700; background: linear-gradient(135deg, #a78bfa 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.markdown-body h2 { font-size: 2em; margin: 28px 0 16px; font-weight: 600; color: #a78bfa; }
.markdown-body h3 { font-size: 1.5em; margin: 24px 0 12px; font-weight: 600; color: #c084fc; }
.markdown-body h4 { font-size: 1.2em; margin: 20px 0 10px; font-weight: 600; color: #a78bfa; }
.markdown-body p { margin: 0 0 20px; color: #d1cfe2; }
.markdown-body ul, .markdown-body ol { margin: 0 0 20px; padding-left: 2em; }
.markdown-body li { margin-top: 8px; }
.markdown-body table { border-spacing: 0; border-collapse: separate; border-radius: 1rem; overflow: hidden; width: 100%; margin: 0 0 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); }
.markdown-body table th { font-weight: 600; padding: 14px 16px; background: linear-gradient(135deg, #a78bfa 0%, #c084fc 100%); color: #1a1a2e; text-align: left; }
.markdown-body table td { padding: 12px 16px; background: #252541; border-top: 1px solid #3d3d5c; }
.markdown-body code { padding: 4px 8px; font-size: 0.9em; background: rgba(167, 139, 250, 0.2); border-radius: 0.5rem; font-family: 'SF Mono', 'Fira Code', monospace; color: #c084fc; }
.markdown-body pre { padding: 20px; overflow: auto; font-size: 14px; line-height: 1.6; background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%); border-radius: 1rem; margin: 0 0 20px; }
.markdown-body pre code { padding: 0; background: transparent; display: block; color: #f3f0ff; }
.markdown-body blockquote { padding: 20px 24px; color: #a78bfa; border-left: none; margin: 0 0 20px; background: rgba(167, 139, 250, 0.1); border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); position: relative; border: 1px solid rgba(167, 139, 250, 0.2); }
.markdown-body blockquote::before { content: '"'; position: absolute; left: 16px; top: 8px; font-size: 3em; color: rgba(167, 139, 250, 0.3); font-family: Georgia, serif; }
.markdown-body a { color: #a78bfa; text-decoration: none; border-bottom: 2px solid rgba(167, 139, 250, 0.3); padding-bottom: 1px; transition: all 0.2s; }
.markdown-body a:hover { border-bottom-color: #a78bfa; }
.markdown-body strong { font-weight: 700; background: linear-gradient(135deg, #a78bfa 0%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.markdown-body hr { height: 2px; margin: 32px 0; background: linear-gradient(90deg, transparent, rgba(167, 139, 250, 0.4), transparent); border: 0; }
.markdown-body img { max-width: 100%; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); }
`,
  },
  {
    name: "Academic",
    id: "academic",
    light: `
body { font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; line-height: 1.7; color: #1a1a1a; background: #f9f7f3; }
.markdown-body { max-width: 640px; margin: 0 auto; padding: 60px 40px; background: #fff; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
@media (max-width: 767px) { .markdown-body { padding: 40px 24px; } }
.markdown-body h1 { font-size: 2.2em; margin: 48px 0 32px; font-weight: 400; text-align: center; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 16px; }
.markdown-body h2 { font-size: 1.6em; margin: 40px 0 20px; font-weight: 400; color: #1a1a1a; }
.markdown-body h3 { font-size: 1.3em; margin: 32px 0 16px; font-weight: 500; color: #2a2a2a; font-style: italic; }
.markdown-body h4 { font-size: 1.1em; margin: 24px 0 12px; font-weight: 600; color: #333; }
.markdown-body p { margin: 0 0 18px; text-align: justify; text-indent: 1.5em; }
.markdown-body p:first-of-type { text-indent: 0; }
.markdown-body ul, .markdown-body ol { margin: 0 0 18px; padding-left: 2.5em; }
.markdown-body li { margin-top: 6px; text-align: justify; }
.markdown-body table { border-spacing: 0; border-collapse: collapse; width: 100%; margin: 24px 0; font-size: 0.9em; }
.markdown-body table th { font-weight: 600; padding: 10px 12px; border-top: 2px solid #000; border-bottom: 1px solid #000; text-align: left; }
.markdown-body table td { padding: 8px 12px; border-bottom: 1px solid #ddd; }
.markdown-body table tbody tr:last-child td { border-bottom: 2px solid #000; }
.markdown-body code { padding: 2px 5px; font-size: 0.85em; background: #f5f5f5; font-family: 'Courier New', Courier, monospace; color: #333; }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 0.8em; line-height: 1.5; background: #fafafa; margin: 24px 0; border-left: 3px solid #ccc; font-family: 'Courier New', Courier, monospace; }
.markdown-body pre code { padding: 0; background: transparent; display: block; }
.markdown-body blockquote { padding: 0 24px; color: #444; border-left: 3px solid #999; margin: 24px 0; font-style: italic; }
.markdown-body a { color: #1a1a1a; text-decoration: none; border-bottom: 1px dotted #666; }
.markdown-body a:hover { border-bottom-style: solid; }
.markdown-body a::after { content: " [" counter(footnote) "]"; counter-increment: footnote; font-size: 0.8em; vertical-align: super; color: #666; }
.markdown-body strong { font-weight: 600; }
.markdown-body em { font-style: italic; }
.markdown-body hr { height: 1px; margin: 40px auto; background: #ccc; border: 0; width: 50%; }
.markdown-body img { max-width: 100%; display: block; margin: 24px auto; }
`,
    dark: `
body { font-family: Georgia, 'Times New Roman', Times, serif; font-size: 18px; line-height: 1.7; color: #d4d4d4; background: #1a1612; }
.markdown-body { max-width: 640px; margin: 0 auto; padding: 60px 40px; background: #242018; box-shadow: 0 0 20px rgba(0,0,0,0.3); }
@media (max-width: 767px) { .markdown-body { padding: 40px 24px; } }
.markdown-body h1 { font-size: 2.2em; margin: 48px 0 32px; font-weight: 400; text-align: center; color: #f0f0f0; border-bottom: 1px solid #555; padding-bottom: 16px; }
.markdown-body h2 { font-size: 1.6em; margin: 40px 0 20px; font-weight: 400; color: #e8e8e8; }
.markdown-body h3 { font-size: 1.3em; margin: 32px 0 16px; font-weight: 500; color: #d8d8d8; font-style: italic; }
.markdown-body h4 { font-size: 1.1em; margin: 24px 0 12px; font-weight: 600; color: #ccc; }
.markdown-body p { margin: 0 0 18px; text-align: justify; text-indent: 1.5em; }
.markdown-body p:first-of-type { text-indent: 0; }
.markdown-body ul, .markdown-body ol { margin: 0 0 18px; padding-left: 2.5em; }
.markdown-body li { margin-top: 6px; text-align: justify; }
.markdown-body table { border-spacing: 0; border-collapse: collapse; width: 100%; margin: 24px 0; font-size: 0.9em; }
.markdown-body table th { font-weight: 600; padding: 10px 12px; border-top: 2px solid #888; border-bottom: 1px solid #888; text-align: left; }
.markdown-body table td { padding: 8px 12px; border-bottom: 1px solid #444; }
.markdown-body table tbody tr:last-child td { border-bottom: 2px solid #888; }
.markdown-body code { padding: 2px 5px; font-size: 0.85em; background: #1a1a1a; font-family: 'Courier New', Courier, monospace; color: #bbb; }
.markdown-body pre { padding: 16px; overflow: auto; font-size: 0.8em; line-height: 1.5; background: #1a1814; margin: 24px 0; border-left: 3px solid #666; font-family: 'Courier New', Courier, monospace; }
.markdown-body pre code { padding: 0; background: transparent; display: block; }
.markdown-body blockquote { padding: 0 24px; color: #aaa; border-left: 3px solid #666; margin: 24px 0; font-style: italic; }
.markdown-body a { color: #d4d4d4; text-decoration: none; border-bottom: 1px dotted #888; }
.markdown-body a:hover { border-bottom-style: solid; }
.markdown-body a::after { content: " [" counter(footnote) "]"; counter-increment: footnote; font-size: 0.8em; vertical-align: super; color: #888; }
.markdown-body strong { font-weight: 600; }
.markdown-body em { font-style: italic; }
.markdown-body hr { height: 1px; margin: 40px auto; background: #555; border: 0; width: 50%; }
.markdown-body img { max-width: 100%; display: block; margin: 24px auto; }
`,
  },
];

export const SHIKI_EXPORT_CSS = `
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

export const KATEX_CSS = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.40/dist/katex.min.css" integrity="sha384-vKruj+a13U8yHIkAyGgK1J3ArTLzrFGBbBc0tDp4ad/EyewESeXE/Iv67Aj8gKZ0" crossorigin="anonymous">`;

export const MERMAID_SCRIPT = `<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
</script>`;

export const PDF_PRINT_CSS = `
@media print {
  body { background: #fff !important; }
  .markdown-body { max-width: 100%; padding: 0; }
  @page { margin: 15mm; }
  h1, h2, h3, h4, h5, h6 { page-break-after: avoid; }
  pre, blockquote { page-break-inside: avoid; }
  img { page-break-inside: avoid; }
}
`;

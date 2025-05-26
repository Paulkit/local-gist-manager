"use client";

import { Prism as PrismSyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeSyntaxHighlighterProps {
  content: string;
  language?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  filename?: string; // add filename prop
}

const CodeSyntaxHighlighter = ({ content, language, onClick, onDoubleClick, className, filename }: CodeSyntaxHighlighterProps) => {
  // Map common language names to Prism-supported languages
  const getLanguage = (lang?: string, filename?: string) => {
    if (!lang && filename) {
      if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
      if (filename.endsWith('.jsx') || filename.endsWith('.js')) return 'javascript';
      if (filename.endsWith('.css')) return 'css';
      if (filename.endsWith('.json')) return 'json';
      if (filename.endsWith('.md')) return 'markdown';
      if (filename.endsWith('.sh')) return 'bash';
      if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return 'yaml';
      if (filename.endsWith('.html')) return 'html';
      if (filename.endsWith('.txt')) return 'markdown'; // treat txt as markdown for color
    }
    if (!lang) return 'markdown'; // fallback to markdown for color
    const langMap: { [key: string]: string } = {
      "JavaScript": "javascript",
      "TypeScript": "typescript",
      "Python": "python",
      "Java": "java",
      "C++": "cpp",
      "C#": "csharp",
      "Go": "go",
      "Rust": "rust",
      "PHP": "php",
      "Ruby": "ruby",
      "Swift": "swift",
      "Kotlin": "kotlin",
      "HTML": "html",
      "CSS": "css",
      "SCSS": "scss",
      "JSON": "json",
      "XML": "xml",
      "Markdown": "markdown",
      "Shell": "bash",
      "SQL": "sql",
      "YAML": "yaml",
      "Dockerfile": "dockerfile",
      "Text": "markdown", // treat 'Text' as markdown for color
    };
    return langMap[lang] || lang.toLowerCase();
  };

  const customStyle = {
    ...oneLight,
    'pre[class*="language-"]': {
      ...oneLight['pre[class*="language-"]'],
      background: "#fafafa",
      margin: 0,
      padding: "1rem",
      fontSize: "0.875rem",
      lineHeight: "1.5",
    },
    'code[class*="language-"]': {
      ...oneLight['code[class*="language-"]'],
      background: "transparent",
      fontSize: "0.875rem",
      fontFamily: '"Fira Code", "Monaco", "Menlo", "Ubuntu Mono", monospace',
    },
  };  return (
    <div 
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`relative group ${className || ''}`}
      title={onClick ? "Click to edit" : onDoubleClick ? "Double-click to edit" : undefined}
    >
      {onDoubleClick && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="bg-blue-600 text-white p-1 rounded text-xs flex items-center space-x-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span>Edit</span>
          </div>
        </div>
      )}
      <PrismSyntaxHighlighter
        language={getLanguage(language, filename)}
        style={customStyle}
        showLineNumbers={content.split("\n").length > 5}
        wrapLines={true}
        customStyle={{
          margin: 0,
          background: "#fafafa",
        }}
      >
        {content}
      </PrismSyntaxHighlighter>
    </div>
  );
};

export default CodeSyntaxHighlighter;

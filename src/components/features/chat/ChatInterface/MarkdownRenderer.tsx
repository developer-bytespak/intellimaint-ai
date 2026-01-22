'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReactNode } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        // Headings
        h1: ({ children }: { children?: ReactNode }) => (
          <h1 className="text-2xl font-bold mb-3 mt-4 text-white">{children}</h1>
        ),
        h2: ({ children }: { children?: ReactNode }) => (
          <h2 className="text-xl font-bold mb-2 mt-3 text-white">{children}</h2>
        ),
        h3: ({ children }: { children?: ReactNode }) => (
          <h3 className="text-lg font-semibold mb-2 mt-3 text-white">{children}</h3>
        ),
        // Paragraphs
        p: ({ children }: { children?: ReactNode }) => (
          <p className="mb-2 text-white leading-relaxed">{children}</p>
        ),
        // Lists
        ul: ({ children }: { children?: ReactNode }) => (
          <ul className="list-disc list-outside mb-2 ml-6 space-y-1 text-white">{children}</ul>
        ),
        ol: ({ children }: { children?: ReactNode }) => (
          <ol className="list-decimal list-outside mb-2 ml-6 space-y-1 text-white">{children}</ol>
        ),
        li: ({ children }: { children?: ReactNode }) => (
          <li className="ml-2 text-white leading-relaxed">{children}</li>
        ),
        // Code blocks
        code: ({ inline, children, className }: { inline?: boolean; children?: ReactNode; className?: string }) => {
          if (inline) {
            return (
              <code className="bg-[#3a4a5a] px-1.5 py-0.5 rounded text-sm text-blue-300 font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className={className}>
              {children}
            </code>
          );
        },
        pre: ({ children }: { children?: ReactNode }) => (
          <pre className="bg-[#1f2632] p-3 rounded-lg overflow-x-auto mb-2 border border-[#3a4a5a]">
            {children}
          </pre>
        ),
        // Blockquotes
        blockquote: ({ children }: { children?: ReactNode }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 my-2 italic text-gray-300">
            {children}
          </blockquote>
        ),
        // Links
        a: ({ href, children }: { href?: string; children?: ReactNode }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
            {children}
          </a>
        ),
        // Strong and emphasis
        strong: ({ children }: { children?: ReactNode }) => (
          <strong className="font-bold text-white">{children}</strong>
        ),
        em: ({ children }: { children?: ReactNode }) => (
          <em className="italic text-white">{children}</em>
        ),
        // Horizontal rule
        hr: () => (
          <hr className="my-4 border-[#3a4a5a]" />
        ),
        // Tables
        table: ({ children }: { children?: ReactNode }) => (
          <div className="overflow-x-auto my-2">
            <table className="min-w-full border-collapse border border-[#3a4a5a]">
              {children}
            </table>
          </div>
        ),
        th: ({ children }: { children?: ReactNode }) => (
          <th className="border border-[#3a4a5a] px-4 py-2 bg-[#2a3441] text-left font-semibold text-white">
            {children}
          </th>
        ),
        td: ({ children }: { children?: ReactNode }) => (
          <td className="border border-[#3a4a5a] px-4 py-2 text-white">
            {children}
          </td>
        ),
      }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'Salin', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    let success = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch {
      // Fallback for iframe / non-secure contexts
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Salin: ${text}`}
      title={`Salin ${text}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 active:scale-95 ${
        copied
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs'
          : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
      } ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
      )}
      <span className="whitespace-nowrap">{copied ? 'Tersalin' : label}</span>
    </button>
  );
}

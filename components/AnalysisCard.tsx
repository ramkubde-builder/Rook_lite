import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface AnalysisCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  colorClass?: string;
  contentToCopy?: string;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  title,
  icon,
  children,
  defaultOpen = false,
  colorClass = "border-l-4 border-indigo-500",
  contentToCopy
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm mb-4 overflow-hidden transition-all duration-200 border border-slate-100 ${colorClass}`}>
      <div
        className="flex items-center justify-between p-4 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="text-slate-600">{icon}</div>
          <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
            {contentToCopy && (
                <button
                    onClick={handleCopy}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-white"
                    title="Copy section content"
                >
                    {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
            )}
          {isOpen ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-5 border-t border-slate-100 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};
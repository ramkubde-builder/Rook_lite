import React from 'react';
import { Play, Sparkles, Search, Lightbulb, Scale } from 'lucide-react';
import { AppMode } from '../types';

interface InputSectionProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  inputs: { a: string; b: string };
  setInputs: (inputs: { a: string; b: string }) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onDemo: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
  mode,
  setMode,
  inputs,
  setInputs,
  onAnalyze,
  isLoading,
  onDemo
}) => {
  
  const handleInputChange = (key: 'a' | 'b', value: string) => {
    setInputs({ ...inputs, [key]: value });
  };

  const getModeDescription = () => {
    if (mode === 'audit') return "Paste a landing page URL or raw copy. Rook Lite will identify gaps and optimize it.";
    if (mode === 'idea') return "Describe your product idea, target audience, and goals. Rook Lite will build your GTM strategy.";
    return "Compare your product (Variant A) against competitors (Variant B) to find your winning edge.";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mode Selector */}
      <div className="bg-white rounded-t-xl border-t border-x border-slate-200 p-2 grid grid-cols-3 gap-1 shadow-sm z-10">
        <button
           onClick={() => setMode('audit')}
           disabled={isLoading}
           className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
             mode === 'audit' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
           }`}
        >
           <Search size={18} className="mb-1" /> Page Audit
        </button>
        <button
           onClick={() => setMode('idea')}
           disabled={isLoading}
           className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
             mode === 'idea' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
           }`}
        >
           <Lightbulb size={18} className="mb-1" /> Idea & GTM
        </button>
        <button
           onClick={() => setMode('compare')}
           disabled={isLoading}
           className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
             mode === 'compare' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
           }`}
        >
           <Scale size={18} className="mb-1" /> Compare
        </button>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-xl shadow-md border-x border-b border-slate-200 p-6 flex flex-col flex-grow -mt-px">
        <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded border border-slate-100">
           {getModeDescription()}
        </p>

        <div className="flex-grow space-y-4 overflow-y-auto">
            {mode === 'compare' ? (
                <>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Variant A (My Product)</label>
                        <textarea
                            className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            placeholder="Paste your copy..."
                            value={inputs.a}
                            onChange={(e) => handleInputChange('a', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Variant B (Competitors)</label>
                        <textarea
                            className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            placeholder="Paste one or more competitors (URLs or text)..."
                            value={inputs.b}
                            onChange={(e) => handleInputChange('b', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </>
            ) : (
                <textarea
                    className="w-full h-full min-h-[300px] p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-800 text-sm font-mono leading-relaxed"
                    placeholder={mode === 'audit' ? "e.g. https://mysaas.com\nOR paste raw text..." : "e.g. 'I want to build an AI app for dog walkers...'"}
                    value={inputs.a}
                    onChange={(e) => handleInputChange('a', e.target.value)}
                    disabled={isLoading}
                />
            )}
        </div>

        <div className="mt-4 space-y-3">
          <button
            onClick={onAnalyze}
            disabled={isLoading || !inputs.a.trim() || (mode === 'compare' && !inputs.b.trim())}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-lg font-bold text-white transition-all shadow-lg transform active:scale-[0.98] ${
              isLoading || !inputs.a.trim() || (mode === 'compare' && !inputs.b.trim())
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : mode === 'audit' ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                : mode === 'idea' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
            }`}
          >
            {isLoading ? (
              "Thinking..."
            ) : (
              <>
                <Sparkles size={18} /> {mode === 'compare' ? 'Compare' : 'Generate Strategy'}
              </>
            )}
          </button>
          
          <button
            onClick={onDemo}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors text-sm"
          >
            <Play size={14} /> Load {mode === 'compare' ? 'Comparison' : 'Demo'} Content
          </button>
        </div>
      </div>
    </div>
  );
};
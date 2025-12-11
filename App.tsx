import React, { useState, useEffect } from 'react';
import { Activity, History } from 'lucide-react';
import { InputSection } from './components/InputSection';
import { ResultsSection } from './components/ResultsSection';
import { LoadingState } from './components/LoadingState';
import { SavedAnalysesPanel } from './components/SavedAnalysesPanel';
import { AnalysisResult, AppMode, SavedAnalysis } from './types';
import { analyzeMarketingContent } from './services/geminiService';
import { DEMO_CONTENT } from './constants';

const RookLogo = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
    className="text-indigo-600"
  >
    <path d="M5 20H19V22H5V20ZM17 2H15V5H13V2H11V5H9V2H7V7H17V2ZM7 8H17L15.5 18H8.5L7 8Z" />
    <path d="M6 19H18V21H6V19Z" fill="currentColor" />
  </svg>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('audit');
  const [inputs, setInputs] = useState<{ a: string; b: string; image?: string; video?: string }>({ a: '', b: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // History State
  const [savedItems, setSavedItems] = useState<SavedAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('rook_lite_history');
    if (stored) {
        try {
            setSavedItems(JSON.parse(stored));
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }
  }, []);

  // Save history handler
  const saveToHistory = (result: AnalysisResult, currentInputs: { a: string, b: string, image?: string, video?: string }) => {
      const newItem: SavedAnalysis = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          mode: result.mode,
          title: getTitleForHistory(result, currentInputs),
          summary: getSummaryForHistory(result),
          inputs: currentInputs,
          result: result
      };
      const updated = [newItem, ...savedItems].slice(0, 20); // Keep last 20
      setSavedItems(updated);
      localStorage.setItem('rook_lite_history', JSON.stringify(updated));
  };

  const deleteHistoryItem = (id: string) => {
      const updated = savedItems.filter(i => i.id !== id);
      setSavedItems(updated);
      localStorage.setItem('rook_lite_history', JSON.stringify(updated));
  };

  const loadHistoryItem = (item: SavedAnalysis) => {
      setMode(item.mode);
      setInputs(item.inputs);
      setAnalysisData(item.result);
      setShowHistory(false);
  };

  // Helper to generate titles
  const getTitleForHistory = (res: AnalysisResult, ins: {a:string, b:string}) => {
      if (res.mode === 'audit') return res.improved_copy.headline || "Page Audit";
      if (res.mode === 'idea') return "Idea Strategy"; 
      if (res.mode === 'compare') return "Comparison Analysis";
      return "Strategy Session";
  };
  
  const getSummaryForHistory = (res: AnalysisResult) => {
      if (res.mode === 'audit') return res.overview.page_intent;
      if (res.mode === 'idea') return res.opportunity_scan.problem_summary;
      if (res.mode === 'compare') return res.verdict;
      return "";
  };

  const handleAnalyze = async () => {
    if (!inputs.a.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnalysisData(null);

    try {
      const data = await analyzeMarketingContent(mode, inputs);
      setAnalysisData(data);
      saveToHistory(data, inputs);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemo = () => {
    if (mode === 'audit') setInputs({ a: DEMO_CONTENT.audit, b: '' });
    else if (mode === 'idea') setInputs({ a: DEMO_CONTENT.idea, b: '' });
    else setInputs({ a: DEMO_CONTENT.compareA, b: DEMO_CONTENT.compareB });
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border-2 border-indigo-100 bg-indigo-50">
               <RookLogo />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Rook Lite</h1>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">AI Marketing CMO</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
             >
                <History size={18} /> <span className="hidden sm:inline">History</span>
             </button>
             <div className="hidden md:flex items-center gap-2 text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                <Activity size={14} />
                <span>Online</span>
             </div>
          </div>
        </div>
      </header>

      {/* History Panel */}
      <SavedAnalysesPanel 
        isOpen={showHistory} 
        onToggle={() => setShowHistory(!showHistory)} 
        savedItems={savedItems}
        onLoad={loadHistoryItem}
        onDelete={deleteHistoryItem}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          
          {/* Left Column: Input */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] z-30">
             <InputSection 
               mode={mode}
               setMode={setMode}
               inputs={inputs}
               setInputs={setInputs}
               onAnalyze={handleAnalyze}
               isLoading={isLoading}
               onDemo={loadDemo}
             />
          </div>

          {/* Right Column: Output */}
          <div className="w-full lg:w-2/3 min-h-[500px]">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 animate-pulse">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                {error}
              </div>
            )}

            {isLoading && <LoadingState mode={mode} />}

            {!isLoading && !analysisData && !error && (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-4 min-h-[400px] border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                <div className="bg-slate-100 p-4 rounded-full">
                    <Activity size={32} className="text-slate-300" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-600">Ready to Strategize</h3>
                    <p className="text-sm max-w-xs mx-auto mt-2 text-slate-500">
                        Select a mode on the left and input your content to receive a CMO-level audit.
                    </p>
                </div>
              </div>
            )}

            {!isLoading && analysisData && (
              <ResultsSection data={analysisData} />
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
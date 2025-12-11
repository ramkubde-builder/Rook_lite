import React from 'react';
import { Trash2, History, RotateCcw } from 'lucide-react';
import { SavedAnalysis } from '../types';

interface SavedAnalysesPanelProps {
  savedItems: SavedAnalysis[];
  onLoad: (item: SavedAnalysis) => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SavedAnalysesPanel: React.FC<SavedAnalysesPanelProps> = ({
  savedItems,
  onLoad,
  onDelete,
  isOpen,
  onToggle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 border-l border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <History size={18} className="text-indigo-600" /> Analysis History
        </h3>
        <button onClick={onToggle} className="text-slate-400 hover:text-slate-600">
          Close
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {savedItems.length === 0 ? (
            <div className="text-center text-slate-400 py-10 text-sm">
                No saved analyses yet. <br/> Run a strategy to save it automatically.
            </div>
        ) : (
            savedItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                         <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                             item.mode === 'audit' ? 'bg-indigo-100 text-indigo-700' :
                             item.mode === 'idea' ? 'bg-emerald-100 text-emerald-700' :
                             'bg-orange-100 text-orange-700'
                         }`}>
                             {item.mode}
                         </span>
                         <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            className="text-slate-300 hover:text-red-500 transition-colors"
                            title="Delete"
                         >
                             <Trash2 size={14} />
                         </button>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm mb-1 truncate">{item.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{item.summary}</p>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400">
                            {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                        <button 
                            onClick={() => onLoad(item)}
                            className="text-xs flex items-center gap-1 text-indigo-600 font-medium hover:underline"
                        >
                            <RotateCcw size={12} /> Reload
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};
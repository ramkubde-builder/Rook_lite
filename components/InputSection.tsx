import React, { useRef, useState } from 'react';
import { Play, Sparkles, Search, Lightbulb, Scale, ImagePlus, X, Video, Mic, StopCircle, Loader2, Check, Plus } from 'lucide-react';
import { AppMode, MediaItem } from '../types';
import { transcribeAudio } from '../services/geminiService';

interface InputSectionProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  inputs: { a: string; b: string; mediaA: MediaItem[]; mediaB: MediaItem[] };
  setInputs: (inputs: { a: string; b: string; mediaA: MediaItem[]; mediaB: MediaItem[] }) => void;
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
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const handleInputChange = (key: 'a' | 'b', value: string) => {
    setInputs({ ...inputs, [key]: value });
  };

  const handleModeSwitch = (newMode: AppMode) => {
    if (mode === newMode) return;
    setMode(newMode);
    // Reset inputs when switching modes
    setInputs({ a: '', b: '', mediaA: [], mediaB: [] });
  };

  // --- Multiple Media Handling ---
  const handleMediaUpload = (
      e: React.ChangeEvent<HTMLInputElement>, 
      variant: 'A' | 'B'
  ) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          const newItems: MediaItem[] = [];
          const promises = Array.from(files).map((file: File) => {
              return new Promise<void>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                      const type = file.type.startsWith('video') ? 'video' : 'image';
                      newItems.push({
                          id: Math.random().toString(36).substr(2, 9),
                          type,
                          data: reader.result as string
                      });
                      resolve();
                  };
                  reader.readAsDataURL(file);
              });
          });

          Promise.all(promises).then(() => {
              if (variant === 'A') {
                  setInputs({ ...inputs, mediaA: [...inputs.mediaA, ...newItems] });
              } else {
                  setInputs({ ...inputs, mediaB: [...inputs.mediaB, ...newItems] });
              }
              // Reset input value to allow re-uploading same file
              e.target.value = '';
          });
      }
  };

  const removeMedia = (variant: 'A' | 'B', id: string) => {
      if (variant === 'A') {
          setInputs({ ...inputs, mediaA: inputs.mediaA.filter(item => item.id !== id) });
      } else {
          setInputs({ ...inputs, mediaB: inputs.mediaB.filter(item => item.id !== id) });
      }
  };

  // --- Audio Recording & Transcription ---
  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          const audioChunks: Blob[] = [];

          mediaRecorder.ondataavailable = (event) => {
              audioChunks.push(event.data);
          };

          mediaRecorder.onstop = async () => {
              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // Use webm for broad support
              setIsTranscribing(true);
              const reader = new FileReader();
              reader.readAsDataURL(audioBlob);
              reader.onloadend = async () => {
                  const base64Audio = reader.result as string;
                  try {
                      const text = await transcribeAudio(base64Audio, 'audio/webm');
                      // Append transcribed text to Input A
                      setInputs({ 
                          ...inputs, 
                          a: inputs.a ? `${inputs.a}\n\n[Transcribed]: ${text}` : text 
                      });
                  } catch (err) {
                      console.error("Transcription failed", err);
                      alert("Failed to transcribe audio.");
                  } finally {
                      setIsTranscribing(false);
                  }
              };
          };

          mediaRecorder.start();
          setIsRecording(true);
      } catch (err) {
          console.error("Error accessing microphone:", err);
          alert("Could not access microphone.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
      }
  };

  const getModeDescription = () => {
    if (mode === 'audit') return "Paste a landing page URL or raw copy. Upload screenshots or video scans for visual analysis.";
    if (mode === 'idea') return "Describe your product idea. Upload sketches, reference images, or demo videos.";
    return "Compare your product (Variant A) against competitors (Variant B). Upload visuals to compare design.";
  };

  // --- Small Grid Component ---
  const MediaGrid = ({ items, onUpload, onRemove }: { items: MediaItem[], onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, onRemove: (id: string) => void }) => {
      const inputRef = useRef<HTMLInputElement>(null);
      
      return (
          <div className="flex flex-wrap gap-2 items-center">
              {items.map((item) => (
                  <div key={item.id} className="relative group w-10 h-10">
                      {item.type === 'image' ? (
                          <img src={item.data} className="w-full h-full rounded-md object-cover border border-slate-300 shadow-sm" alt="Thumbnail" />
                      ) : (
                          <div className="w-full h-full rounded-md bg-slate-800 flex items-center justify-center border border-slate-300 shadow-sm">
                              <Play size={12} className="text-white" />
                          </div>
                      )}
                      <button 
                          onClick={() => onRemove(item.id)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                          <X size={10} />
                      </button>
                  </div>
              ))}
              
              <button 
                  onClick={() => inputRef.current?.click()}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-dashed border-slate-300 text-slate-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all shadow-sm"
                  title="Add Image or Video"
              >
                  <Plus size={16} />
              </button>
              <input 
                  type="file" 
                  ref={inputRef} 
                  className="hidden" 
                  accept="image/*,video/*"
                  multiple
                  onChange={onUpload}
                  disabled={isLoading}
              />
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mode Selector */}
      <div className="bg-white rounded-t-xl border-t border-x border-slate-200 p-2 grid grid-cols-3 gap-1 shadow-sm z-10">
        <button
           onClick={() => handleModeSwitch('audit')}
           disabled={isLoading}
           className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
             mode === 'audit' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
           }`}
        >
           <Search size={18} className="mb-1" /> Page Audit
        </button>
        <button
           onClick={() => handleModeSwitch('idea')}
           disabled={isLoading}
           className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
             mode === 'idea' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
           }`}
        >
           <Lightbulb size={18} className="mb-1" /> Idea & GTM
        </button>
        <button
           onClick={() => handleModeSwitch('compare')}
           disabled={isLoading}
           className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
             mode === 'compare' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
           }`}
        >
           <Scale size={18} className="mb-1" /> Compare
        </button>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-b-xl shadow-md border-x border-b border-slate-200 p-6 flex flex-col flex-grow -mt-px relative">
        <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded border border-slate-100">
           {getModeDescription()}
        </p>

        {/* Floating Audio Button */}
        <div className="absolute top-20 right-8 z-20">
             <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading || isTranscribing}
                className={`p-2 rounded-full shadow-md transition-all ${
                    isRecording 
                    ? "bg-red-500 text-white animate-pulse ring-4 ring-red-200" 
                    : isTranscribing
                    ? "bg-slate-100 text-slate-400 cursor-wait"
                    : "bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50"
                }`}
                title="Record Audio Input"
             >
                {isRecording ? <StopCircle size={20} /> : isTranscribing ? <Loader2 size={20} className="animate-spin" /> : <Mic size={20} />}
             </button>
        </div>

        <div className="flex-grow space-y-6 overflow-y-auto">
            {mode === 'compare' ? (
                <>
                    {/* Variant A */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Variant A (My Product)</label>
                            <MediaGrid 
                                items={inputs.mediaA} 
                                onUpload={(e) => handleMediaUpload(e, 'A')}
                                onRemove={(id) => removeMedia('A', id)}
                            />
                        </div>
                        <textarea
                            className="w-full h-24 p-3 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            placeholder="Paste your copy..."
                            value={inputs.a}
                            onChange={(e) => handleInputChange('a', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    {/* Variant B */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-700 uppercase">Variant B (Competitors)</label>
                             <MediaGrid 
                                items={inputs.mediaB} 
                                onUpload={(e) => handleMediaUpload(e, 'B')}
                                onRemove={(id) => removeMedia('B', id)}
                            />
                        </div>
                        <textarea
                            className="w-full h-24 p-3 bg-white border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            placeholder="Paste one or more competitors (URLs or text)..."
                            value={inputs.b}
                            onChange={(e) => handleInputChange('b', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </>
            ) : (
                <div className="flex flex-col h-full">
                    <textarea
                        className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-800 text-sm font-mono leading-relaxed mb-4"
                        placeholder={mode === 'audit' ? "e.g. https://mysaas.com\nOR paste raw text..." : "e.g. 'I want to build an AI app for dog walkers...'"}
                        value={inputs.a}
                        onChange={(e) => handleInputChange('a', e.target.value)}
                        disabled={isLoading}
                    />
                    
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                         <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Media Attachments</label>
                            <span className="text-[10px] text-slate-400">Images & Videos supported</span>
                         </div>
                         <div className="min-h-[60px] flex items-center">
                            <MediaGrid 
                                items={inputs.mediaA} 
                                onUpload={(e) => handleMediaUpload(e, 'A')}
                                onRemove={(id) => removeMedia('A', id)}
                            />
                         </div>
                    </div>
                </div>
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
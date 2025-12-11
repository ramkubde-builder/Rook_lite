import React, { useRef, useState } from 'react';
import { Play, Sparkles, Search, Lightbulb, Scale, ImagePlus, X, Video, Mic, StopCircle, Loader2 } from 'lucide-react';
import { AppMode } from '../types';
import { transcribeAudio } from '../services/geminiService';

interface InputSectionProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  inputs: { a: string; b: string; image?: string; video?: string };
  setInputs: (inputs: { a: string; b: string; image?: string; video?: string }) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const handleInputChange = (key: 'a' | 'b', value: string) => {
    setInputs({ ...inputs, [key]: value });
  };

  // --- Image Handling ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setInputs({ ...inputs, image: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  const removeImage = () => {
      setInputs({ ...inputs, image: undefined });
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  // --- Video Handling ---
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setInputs({ ...inputs, video: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  }

  const removeVideo = () => {
      setInputs({ ...inputs, video: undefined });
      if (videoInputRef.current) {
          videoInputRef.current.value = "";
      }
  }

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
    if (mode === 'audit') return "Paste a landing page URL or raw copy. Upload a screenshot or video scan for visual analysis.";
    if (mode === 'idea') return "Describe your product idea. Upload sketches, reference images, or demo videos.";
    return "Compare your product (Variant A) against competitors (Variant B). Upload visuals to compare design.";
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

        <div className="flex-grow space-y-4 overflow-y-auto">
            {mode === 'compare' ? (
                <>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Variant A (My Product)</label>
                        <textarea
                            className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            placeholder="Paste your copy..."
                            value={inputs.a}
                            onChange={(e) => handleInputChange('a', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Variant B (Competitors)</label>
                        <textarea
                            className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            placeholder="Paste one or more competitors (URLs or text)..."
                            value={inputs.b}
                            onChange={(e) => handleInputChange('b', e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </>
            ) : (
                <textarea
                    className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-800 text-sm font-mono leading-relaxed"
                    placeholder={mode === 'audit' ? "e.g. https://mysaas.com\nOR paste raw text..." : "e.g. 'I want to build an AI app for dog walkers...'"}
                    value={inputs.a}
                    onChange={(e) => handleInputChange('a', e.target.value)}
                    disabled={isLoading}
                />
            )}

            {/* Media Upload Area */}
            <div className="flex gap-4 mt-2">
                {/* Image Upload */}
                <div className="flex-1">
                     {!inputs.image ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="h-32 border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group"
                        >
                            <ImagePlus className="text-slate-400 group-hover:text-indigo-500 mb-2" size={24} />
                            <span className="text-xs text-slate-500 font-medium">Add Image</span>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={isLoading}
                            />
                        </div>
                    ) : (
                        <div className="relative h-32 border border-slate-200 rounded-lg overflow-hidden group bg-slate-50 flex items-center justify-center">
                            <img src={inputs.image} alt="Upload preview" className="h-full w-auto object-cover" />
                            <button 
                                onClick={removeImage}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Video Upload */}
                <div className="flex-1">
                    {!inputs.video ? (
                        <div 
                            onClick={() => videoInputRef.current?.click()}
                            className="h-32 border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-300 transition-all group"
                        >
                            <Video className="text-slate-400 group-hover:text-indigo-500 mb-2" size={24} />
                            <span className="text-xs text-slate-500 font-medium">Add Video</span>
                            <input 
                                type="file" 
                                ref={videoInputRef} 
                                className="hidden" 
                                accept="video/*"
                                onChange={handleVideoUpload}
                                disabled={isLoading}
                            />
                        </div>
                    ) : (
                         <div className="relative h-32 border border-slate-200 rounded-lg overflow-hidden group bg-slate-900 flex items-center justify-center">
                            <video src={inputs.video} className="h-full w-auto" />
                            <button 
                                onClick={removeVideo}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors z-10"
                            >
                                <X size={14} />
                            </button>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Play size={24} className="text-white opacity-50" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
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
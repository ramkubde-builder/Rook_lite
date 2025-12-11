import React, { useEffect, useState } from 'react';
import { BrainCircuit, Loader2, Target, Lightbulb, Scale } from 'lucide-react';
import { AppMode } from '../types';

const STEPS_AUDIT = [
  "Connecting to Knowledge Base...",
  "Detecting page intent & goal...",
  "Profiling target audience psychology...",
  "Scanning for trust & clarity gaps...",
  "Drafting high-conversion copy replacements...",
  "Finalizing SEO & Ad strategy..."
];

const STEPS_IDEA = [
  "Scanning market trends & signals...",
  "Building Ideal Customer Profile (ICP)...",
  "Formulating Go-To-Market narrative...",
  "Designing landing page wireframe...",
  "Generating 7-day launch content...",
  "Finalizing channel strategy..."
];

const STEPS_COMPARE = [
  "Analyzing Variant A properties...",
  "Scanning Competitors (Variant B)...",
  "Reviewing social footprints & sentiment...",
  "Calculating head-to-head scoreboard...",
  "Identifying critical differentiators...",
  "Synthesizing winning action plan..."
];

interface LoadingStateProps {
  mode: AppMode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ mode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = mode === 'audit' ? STEPS_AUDIT : mode === 'idea' ? STEPS_IDEA : STEPS_COMPARE;
  const Icon = mode === 'audit' ? Target : mode === 'idea' ? Lightbulb : Scale;

  useEffect(() => {
    // Reset step when mode changes
    setCurrentStep(0);
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, [mode, steps.length]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-8 text-center bg-white rounded-xl border border-slate-100 shadow-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-shimmer"></div>
      
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-10 animate-pulse rounded-full"></div>
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 relative z-10">
            <Icon size={48} className="text-indigo-600 animate-pulse" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 mb-2">Rook Lite is Strategizing</h3>
      <p className="text-slate-500 mb-8 text-sm uppercase tracking-wider font-medium">Mode: {mode === 'idea' ? 'Go-To-Market' : mode.charAt(0).toUpperCase() + mode.slice(1)}</p>
      
      <div className="space-y-4 mt-2 w-full max-w-md text-left">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`flex items-center gap-4 transition-all duration-500 ${
              index === currentStep 
                ? "opacity-100 transform translate-x-2" 
                : index < currentStep 
                  ? "opacity-40" 
                  : "opacity-20"
            }`}
          >
            <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
                {index === currentStep ? (
                <Loader2 size={20} className="animate-spin text-indigo-600" />
                ) : index < currentStep ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                ) : (
                <div className="w-4 h-4 rounded-full bg-slate-200" />
                )}
            </div>
            <span className={`text-sm font-medium ${index === currentStep ? "text-indigo-700" : "text-slate-600"}`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
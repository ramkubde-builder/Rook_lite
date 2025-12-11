import React from 'react';
import { AnalysisResult, AuditResult, IdeaResult, CompareResult } from '../types';
import { AnalysisCard } from './AnalysisCard';
import { 
  Target, Search, Megaphone, Share2, Mail, Swords, Lightbulb, 
  ArrowRight, TrendingUp, AlertTriangle, FileText, Layout, 
  Compass, Map, Trophy, ArrowUpRight, CheckCircle2, XCircle,
  BarChart3, Globe, BrainCircuit
} from 'lucide-react';

interface ResultsSectionProps {
  data: AnalysisResult;
}

// --- VISUALIZATION COMPONENTS ---

const RadarChart: React.FC<{ items: { label: string, a: number, b: number }[] }> = ({ items }) => {
    // If we don't have enough data points for a polygon, fallback to a simple list or return null
    if (items.length < 3) return null;

    const size = 320;
    const center = size / 2;
    const radius = 100; // Leave space for labels
    
    // Helper to get coords
    const getPoint = (score: number, index: number, total: number) => {
        const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
        const x = center + (score / 10) * radius * Math.cos(angle);
        const y = center + (score / 10) * radius * Math.sin(angle);
        return { x, y, angle };
    };

    const pointsA = items.map((item, i) => {
        const { x, y } = getPoint(item.a, i, items.length);
        return `${x},${y}`;
    }).join(' ');

    const pointsB = items.map((item, i) => {
        const { x, y } = getPoint(item.b, i, items.length);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="flex flex-col items-center justify-center py-4 select-none">
            <div className="relative w-[320px] h-[320px] md:w-[350px] md:h-[350px]">
                <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible font-sans">
                    {/* Grid Circles */}
                    {[2, 4, 6, 8, 10].map(val => (
                        <circle 
                            key={val} 
                            cx={center} 
                            cy={center} 
                            r={(val / 10) * radius} 
                            fill={val === 10 ? "rgba(241, 245, 249, 0.5)" : "none"}
                            stroke="#e2e8f0" 
                            strokeWidth="1" 
                            strokeDasharray={val === 10 ? "0" : "4 4"}
                        />
                    ))}
                    
                    {/* Axes Lines */}
                    {items.map((_, i) => {
                         const { x, y } = getPoint(10, i, items.length);
                         return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
                    })}

                    {/* Area A (User) */}
                    <polygon points={pointsA} fill="rgba(99, 102, 241, 0.2)" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />
                    
                    {/* Area B (Competitor) */}
                    <polygon points={pointsB} fill="rgba(148, 163, 184, 0.2)" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="4 3" strokeLinejoin="round" />

                    {/* Data Points */}
                    {items.map((item, i) => {
                        const pA = getPoint(item.a, i, items.length);
                        const pB = getPoint(item.b, i, items.length);
                        return (
                            <g key={i}>
                                <circle cx={pA.x} cy={pA.y} r="4" fill="#6366f1" className="drop-shadow-sm transition-all hover:r-6" />
                                <circle cx={pB.x} cy={pB.y} r="4" fill="#94a3b8" className="drop-shadow-sm transition-all hover:r-6" />
                            </g>
                        );
                    })}

                    {/* Labels */}
                    {items.map((item, i) => {
                        const { x, y, angle } = getPoint(12.5, i, items.length);
                        // Convert angle to degrees to determine text anchor
                        let deg = (angle * 180) / Math.PI;
                        // Normalize degree to 0-360
                        deg = (deg + 360) % 360;

                        let textAnchor: "start" | "middle" | "end" = 'middle';
                        if (deg > 10 && deg < 170) textAnchor = 'start';
                        if (deg > 190 && deg < 350) textAnchor = 'end';
                        
                        return (
                            <text 
                                key={i} 
                                x={x} 
                                y={y} 
                                textAnchor={textAnchor} 
                                dominantBaseline="middle" 
                                className="text-[10px] font-bold fill-slate-500 uppercase tracking-wide"
                                style={{ textShadow: '0 1px 2px white' }}
                            >
                                {item.label}
                            </text>
                        );
                    })}
                </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-6 mt-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full shadow-sm"></span>
                    <span className="text-xs font-bold text-slate-700">My Product</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-slate-400 rounded-full shadow-sm"></span>
                    <span className="text-xs font-bold text-slate-500">Competitor</span>
                </div>
            </div>
        </div>
    );
};

const SkillMeter: React.FC<{ label: string, score: number, fix: string }> = ({ label, score, fix }) => (
    <div className="mb-4 last:mb-0">
        <div className="flex justify-between items-end mb-1">
            <span className="font-bold text-slate-700 text-sm">{label}</span>
            <span className="text-indigo-600 font-bold text-sm">{score}/10</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
            <div 
                className={`h-full rounded-full ${score >= 8 ? 'bg-emerald-500' : score >= 5 ? 'bg-indigo-500' : 'bg-orange-500'}`}
                style={{ width: `${score * 10}%` }}
            ></div>
        </div>
        <p className="text-xs text-slate-500 leading-snug"><span className="font-semibold text-indigo-500">Fix:</span> {fix}</p>
    </div>
);

// --- RENDERER 1: AUDIT MODE ---
const AuditRenderer: React.FC<{ data: AuditResult }> = ({ data }) => {
    return (
        <div className="space-y-6 pb-20">
            {/* Overview */}
            <AnalysisCard title="Overview & Strategy" icon={<Target className="text-indigo-600" />} defaultOpen={true}>
                 <div className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Detected Intent</h4>
                             <p className="font-bold text-slate-800 text-lg leading-tight">{data.overview.page_intent}</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Audience</h4>
                             <p className="font-bold text-slate-800 text-lg leading-tight">{data.overview.target_audience}</p>
                        </div>
                     </div>
                     <div className="bg-gradient-to-br from-indigo-50 to-white p-4 rounded-lg border border-indigo-100">
                         <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-500 uppercase mb-2">
                             <BrainCircuit size={14} /> Strategic Analysis
                         </h4>
                         <p className="text-slate-700 text-sm leading-relaxed">{data.overview.strategic_analysis}</p>
                     </div>
                 </div>
            </AnalysisCard>

            {/* Gaps */}
            <AnalysisCard title="Messaging Gaps" icon={<AlertTriangle className="text-rose-600" />} defaultOpen={true} colorClass="border-l-4 border-rose-500">
                 <div className="grid gap-3">
                     {data.messaging_gaps.map((gap, i) => (
                         <div key={i} className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                             <div className={`w-1 shrink-0 rounded-full ${
                                 gap.severity === 'Critical' ? 'bg-rose-500' : 
                                 gap.severity === 'Major' ? 'bg-orange-500' : 'bg-yellow-500'
                             }`}></div>
                             <div className="flex-1">
                                 <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-800 text-sm">{gap.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                        gap.severity === 'Critical' ? 'bg-rose-100 text-rose-700' :
                                        gap.severity === 'Major' ? 'bg-orange-100 text-orange-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>{gap.severity}</span>
                                 </div>
                                 <p className="text-xs text-slate-600">{gap.explanation}</p>
                             </div>
                         </div>
                     ))}
                 </div>
            </AnalysisCard>

            {/* Competitor Radar */}
            <AnalysisCard title="Competitor Radar" icon={<Swords className="text-purple-600" />} colorClass="border-l-4 border-purple-500">
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    {data.competitor_radar.map((point, i) => (
                        <SkillMeter key={i} label={point.dimension} score={point.score} fix={point.fix} />
                    ))}
                </div>
            </AnalysisCard>

            {/* Improved Copy */}
            <AnalysisCard title="Improved Copy" icon={<FileText className="text-blue-600" />} defaultOpen={true} colorClass="border-l-4 border-blue-500">
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200 p-8 rounded-xl shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2 block">New Hero Section</span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">{data.improved_copy.headline}</h2>
                        <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">{data.improved_copy.subheadline}</p>
                    </div>
                    
                    <div className="grid gap-4">
                        {data.improved_copy.cta_optimizations.map((cta, i) => (
                            <div key={i} className="flex flex-col md:flex-row gap-4 items-stretch bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                <div className="flex-1 opacity-60">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Original</span>
                                    <p className="text-sm text-slate-600 line-through mt-1">"{cta.original}"</p>
                                </div>
                                <div className="hidden md:flex items-center text-slate-300">
                                    <ArrowRight size={16} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Optimized</span>
                                    <p className="text-sm font-bold text-slate-800 mt-1">"{cta.improved}"</p>
                                    <p className="text-[10px] text-slate-500 mt-2 italic">{cta.reasoning}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AnalysisCard>

            {/* SEO & Ads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalysisCard title="SEO" icon={<Search className="text-orange-600" />} colorClass="border-l-4 border-orange-500">
                    <div className="space-y-3">
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Title Tag</span>
                            <div className="text-xs bg-slate-800 text-green-400 p-2 rounded font-mono mt-1">{data.seo.title_tag}</div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Desc</span>
                            <div className="text-xs text-slate-600 mt-1 leading-relaxed">{data.seo.meta_description}</div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {data.seo.focus_keywords.map((kw, i) => (
                                <span key={i} className="bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-[10px] font-bold border border-orange-100">{kw}</span>
                            ))}
                        </div>
                    </div>
                </AnalysisCard>
                <AnalysisCard title="Ads" icon={<Megaphone className="text-purple-600" />} colorClass="border-l-4 border-purple-500">
                     <div className="space-y-4">
                        {data.ad_concepts.slice(0, 1).map((ad, i) => (
                            <div key={i}>
                                <span className="text-[10px] font-bold text-purple-600 uppercase bg-purple-50 px-2 py-0.5 rounded">{ad.platform}</span>
                                <h4 className="font-bold text-slate-800 text-sm mt-2">{ad.headline}</h4>
                                <p className="text-xs text-slate-500 mt-1">{ad.primary_text}</p>
                            </div>
                        ))}
                        <p className="text-center text-xs text-slate-400 italic mt-2">+ {data.ad_concepts.length - 1} more variations...</p>
                     </div>
                </AnalysisCard>
            </div>
        </div>
    );
};

// --- RENDERER 2: IDEA MODE ---
const IdeaRenderer: React.FC<{ data: IdeaResult }> = ({ data }) => {
    return (
        <div className="space-y-6 pb-20">
            {/* Opportunity Scan */}
            <AnalysisCard title="Opportunity Scan" icon={<Compass className="text-emerald-600" />} defaultOpen={true} colorClass="border-l-4 border-emerald-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-2">The Problem</h4>
                        <p className="text-sm text-emerald-900 leading-snug">{data.opportunity_scan.problem_summary}</p>
                    </div>
                    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-2">The Victim</h4>
                        <p className="text-sm text-emerald-900 leading-snug">{data.opportunity_scan.who_is_suffering}</p>
                    </div>
                    <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase mb-2">Why Now</h4>
                        <p className="text-sm text-emerald-900 leading-snug">{data.opportunity_scan.why_now}</p>
                    </div>
                </div>
            </AnalysisCard>

            {/* ICP & Persona */}
            <AnalysisCard title="Ideal Customer Profile" icon={<Target className="text-blue-600" />} defaultOpen={true} colorClass="border-l-4 border-blue-500">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                            <span className="text-2xl">👤</span>
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg text-center md:text-left">{data.icp.persona.role}</h4>
                        <p className="text-xs text-slate-500 mt-1 text-center md:text-left">{data.icp.summary}</p>
                    </div>
                    <div className="md:w-2/3 bg-slate-50 p-5 rounded-lg border border-slate-200">
                        <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Pain Points</h5>
                        <ul className="space-y-2 mb-4">
                            {data.icp.persona.pains.map((pain, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-700">
                                    <XCircle size={14} className="text-rose-400 mt-0.5 shrink-0" /> {pain}
                                </li>
                            ))}
                        </ul>
                         <h5 className="text-xs font-bold text-slate-400 uppercase mb-2">Definition of Success</h5>
                         <p className="text-sm text-emerald-700 font-medium flex gap-2">
                             <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> {data.icp.persona.success_definition}
                         </p>
                    </div>
                </div>
            </AnalysisCard>

            {/* Launch Plan Timeline */}
            <AnalysisCard title="7-Day Launch Plan" icon={<Map className="text-orange-600" />} colorClass="border-l-4 border-orange-500">
                <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                    {data.launch_plan.map((day, i) => (
                        <div key={i} className="relative">
                            <span className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-white border-2 border-orange-400 flex items-center justify-center text-[10px] font-bold text-orange-600 z-10">
                                {day.day}
                            </span>
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <p className="text-sm text-slate-700">{day.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </AnalysisCard>
        </div>
    );
};

// --- RENDERER 3: COMPARE MODE ---
const CompareRenderer: React.FC<{ data: CompareResult }> = ({ data }) => {
    return (
        <div className="space-y-6 pb-20">
            {/* Verdict */}
            <div className="bg-slate-900 p-8 rounded-xl shadow-xl text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 opacity-50"></div>
                <div className="relative z-10">
                    <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-3">Final Verdict</h3>
                    <p className="text-xl md:text-2xl text-white font-medium leading-relaxed font-serif italic">"{data.verdict}"</p>
                </div>
            </div>

            {/* Scoreboard */}
            <AnalysisCard title="Scoreboard" icon={<BarChart3 className="text-indigo-600" />} defaultOpen={true} colorClass="border-l-4 border-indigo-500">
                <RadarChart items={data.scoreboard.map(s => ({ label: s.category, a: s.score_a, b: s.score_b }))} />
            </AnalysisCard>

            {/* Social Intelligence - NEW */}
            <AnalysisCard title="Social Intelligence" icon={<Globe className="text-sky-600" />} defaultOpen={true} colorClass="border-l-4 border-sky-500">
                 <div className="space-y-4">
                     <div className="bg-sky-50 p-4 rounded-lg border border-sky-100">
                         <h4 className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase mb-2">
                             <Share2 size={14} /> Digital Footprint Summary
                         </h4>
                         <p className="text-sm text-sky-900 leading-relaxed">{data.social_intel.summary}</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Key Channels</h4>
                             <div className="flex flex-wrap gap-2">
                                 {data.social_intel.key_channels.map((ch, i) => (
                                     <span key={i} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-xs font-medium text-slate-700 shadow-sm">
                                         {ch}
                                     </span>
                                 ))}
                             </div>
                         </div>
                         <div>
                             <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Sentiment</h4>
                             <div className="text-sm font-medium text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                                 {data.social_intel.sentiment_analysis}
                             </div>
                         </div>
                     </div>
                 </div>
            </AnalysisCard>

            {/* Action Plan */}
             <AnalysisCard title="Winning Action Plan" icon={<TrendingUp className="text-emerald-600" />} colorClass="border-l-4 border-emerald-500">
                 <div className="space-y-4">
                     {data.action_plan.revised_headline_a && (
                         <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center mb-6">
                             <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">Pivot Headline</span>
                             <p className="font-bold text-emerald-900 text-lg">"{data.action_plan.revised_headline_a}"</p>
                         </div>
                     )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                             <h4 className="font-bold text-indigo-700 mb-3 text-xs uppercase flex items-center gap-2">
                                 <ArrowUpRight size={14} /> Borrow Strategy
                             </h4>
                             <ul className="space-y-2">
                                 {data.action_plan.borrow_from_b.map((item, i) => (
                                     <li key={i} className="text-sm text-slate-600 flex gap-2">
                                         <span className="text-indigo-400">•</span> {item}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                          <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                             <h4 className="font-bold text-emerald-700 mb-3 text-xs uppercase flex items-center gap-2">
                                 <Trophy size={14} /> Your Winning Edge
                             </h4>
                             <ul className="space-y-2">
                                 {data.action_plan.lean_into_a.map((item, i) => (
                                     <li key={i} className="text-sm text-slate-600 flex gap-2">
                                         <span className="text-emerald-400">•</span> {item}
                                     </li>
                                 ))}
                             </ul>
                         </div>
                     </div>
                 </div>
             </AnalysisCard>
        </div>
    );
};

// --- MAIN EXPORT ---

export const ResultsSection: React.FC<ResultsSectionProps> = ({ data }) => {
  return (
    <>
      <div className="bg-white border-l-4 border-indigo-600 p-6 rounded-r-lg shadow-md mb-8">
        <h3 className="flex items-center gap-2 text-indigo-900 font-bold uppercase tracking-wider text-xs mb-3">
          <BrainCircuit size={16} /> Strategic Reasoning
        </h3>
        <ul className="space-y-2">
            {data.reasoning_log.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                    <span className="text-indigo-500 font-mono text-xs opacity-70 mt-0.5">0{i+1}</span>
                    <span className="text-slate-600 leading-snug">{step}</span>
                </li>
            ))}
        </ul>
      </div>

      {data.mode === 'audit' && <AuditRenderer data={data as AuditResult} />}
      {data.mode === 'idea' && <IdeaRenderer data={data as IdeaResult} />}
      {data.mode === 'compare' && <CompareRenderer data={data as CompareResult} />}
    </>
  );
};
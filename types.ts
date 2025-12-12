export type AppMode = 'audit' | 'idea' | 'compare';

export interface CtaRewrite {
  original: string;
  improved: string;
  reasoning: string;
}

export interface AdCopy {
  platform: 'Google' | 'Facebook' | 'LinkedIn' | 'Instagram';
  headline: string;
  primary_text: string;
}

export interface SocialPost {
  platform: 'Twitter' | 'LinkedIn' | 'Instagram';
  content: string;
  hashtags: string[];
}

export interface SeoSuggestion {
  current: string;
  suggested: string;
  reasoning: string;
}

export interface SeoData {
  title_tag: SeoSuggestion;
  meta_description: SeoSuggestion;
  focus_keywords: {
    current: string[];
    suggested: string[];
    reasoning: string;
  };
}

export interface EmailDraft {
  subject_line: string;
  preview_text: string;
  body: string;
}

// --- Mode 1: Audit Types ---
export interface Gap {
  title: string;
  explanation: string;
  severity: 'Critical' | 'Major' | 'Minor';
}

export interface CompetitorRadarPoint {
  dimension: string;
  score: number; // 0-10
  fix: string;
}

export interface AuditResult {
  mode: 'audit';
  reasoning_log: string[];
  overview: {
    page_intent: string;
    target_audience: string;
    strategic_analysis: string;
    recommendations: string[];
  };
  messaging_gaps: Gap[];
  improved_copy: {
    headline: string;
    subheadline: string;
    cta_optimizations: CtaRewrite[];
    supporting_copy?: string;
  };
  seo: SeoData;
  ad_concepts: AdCopy[];
  social_posts: SocialPost[];
  email_draft: EmailDraft;
  competitor_radar: CompetitorRadarPoint[];
}

// --- Mode 2: Idea Types ---
export interface IdeaResult {
  mode: 'idea';
  reasoning_log: string[];
  opportunity_scan: {
    problem_summary: string;
    who_is_suffering: string;
    why_now: string;
  };
  icp: {
    summary: string;
    persona: {
      role: string;
      situation: string;
      pains: string[];
      success_definition: string;
    };
  };
  positioning: {
    statement: string;
    narrative: string;
  };
  landing_page_structure: {
    sections: { title: string; description: string }[];
    hero_example: { headline: string; subheadline: string; cta: string };
  };
  channel_strategy: {
    channels: string[];
    test_first: string;
    reasoning: string;
  };
  launch_plan: { day: number; content: string }[];
  sample_assets: {
    ads: AdCopy[];
    social: SocialPost[];
    email: EmailDraft;
  };
}

// --- Mode 3: Compare Types ---
export interface ScoreboardItem {
  category: string;
  score_a: number;
  score_b: number;
  winner: 'A' | 'B' | 'Tie';
}

export interface CompareResult {
  mode: 'compare';
  reasoning_log: string[];
  verdict: string;
  scoreboard: ScoreboardItem[];
  social_intel: {
    summary: string;
    key_channels: string[];
    sentiment_analysis: string;
  };
  differences: {
    b_better_points: string[];
    a_edge_points: string[];
  };
  action_plan: {
    borrow_from_b: string[];
    lean_into_a: string[];
    revised_headline_a?: string;
  };
}

export type AnalysisResult = AuditResult | IdeaResult | CompareResult;

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  data: string;
}

export interface SavedAnalysis {
  id: string;
  timestamp: number;
  mode: AppMode;
  title: string;
  summary: string;
  inputs: { 
      a: string; 
      b: string; 
      mediaA: MediaItem[]; 
      mediaB: MediaItem[]; 
  }; 
  result: AnalysisResult;
}

export interface DemoData {
  audit: string;
  idea: string;
  compareA: string;
  compareB: string;
}
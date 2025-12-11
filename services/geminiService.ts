import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION_BASE } from "../constants";
import { AnalysisResult, AppMode } from "../types";

// --- Shared Sub-Schemas ---
const adSchema = {
  type: Type.OBJECT,
  properties: {
    platform: { type: Type.STRING, enum: ["Google", "Facebook", "LinkedIn", "Instagram"] },
    headline: { type: Type.STRING },
    primary_text: { type: Type.STRING },
  },
  required: ["platform", "headline", "primary_text"],
};

const socialSchema = {
  type: Type.OBJECT,
  properties: {
    platform: { type: Type.STRING, enum: ["Twitter", "LinkedIn", "Instagram"] },
    content: { type: Type.STRING },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["platform", "content", "hashtags"],
};

const emailSchema = {
  type: Type.OBJECT,
  properties: {
    subject_line: { type: Type.STRING },
    preview_text: { type: Type.STRING },
    body: { type: Type.STRING },
  },
  required: ["subject_line", "preview_text", "body"],
};

// --- Mode 1: Audit Schema ---
const auditSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, enum: ["audit"] },
    reasoning_log: { type: Type.ARRAY, items: { type: Type.STRING } },
    overview: {
      type: Type.OBJECT,
      properties: {
        page_intent: { type: Type.STRING },
        target_audience: { type: Type.STRING },
        strategic_analysis: { type: Type.STRING },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["page_intent", "target_audience", "strategic_analysis", "recommendations"]
    },
    messaging_gaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          explanation: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Critical", "Major", "Minor"] },
        },
        required: ["title", "explanation", "severity"]
      }
    },
    improved_copy: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        subheadline: { type: Type.STRING },
        supporting_copy: { type: Type.STRING },
        cta_optimizations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              improved: { type: Type.STRING },
              reasoning: { type: Type.STRING },
            },
            required: ["original", "improved", "reasoning"]
          }
        }
      },
      required: ["headline", "subheadline", "cta_optimizations"]
    },
    seo: {
      type: Type.OBJECT,
      properties: {
        title_tag: { type: Type.STRING },
        meta_description: { type: Type.STRING },
        focus_keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["title_tag", "meta_description", "focus_keywords"]
    },
    ad_concepts: { type: Type.ARRAY, items: adSchema },
    social_posts: { type: Type.ARRAY, items: socialSchema },
    email_draft: emailSchema,
    competitor_radar: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dimension: { type: Type.STRING },
          score: { type: Type.NUMBER },
          fix: { type: Type.STRING }
        },
        required: ["dimension", "score", "fix"]
      }
    }
  },
  required: ["mode", "reasoning_log", "overview", "messaging_gaps", "improved_copy", "seo", "ad_concepts", "social_posts", "email_draft", "competitor_radar"]
};

// --- Mode 2: Idea Schema ---
const ideaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, enum: ["idea"] },
    reasoning_log: { type: Type.ARRAY, items: { type: Type.STRING } },
    opportunity_scan: {
      type: Type.OBJECT,
      properties: {
        problem_summary: { type: Type.STRING },
        who_is_suffering: { type: Type.STRING },
        why_now: { type: Type.STRING }
      },
      required: ["problem_summary", "who_is_suffering", "why_now"]
    },
    icp: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        persona: {
            type: Type.OBJECT,
            properties: {
                role: { type: Type.STRING },
                situation: { type: Type.STRING },
                pains: { type: Type.ARRAY, items: { type: Type.STRING } },
                success_definition: { type: Type.STRING }
            },
            required: ["role", "situation", "pains", "success_definition"]
        }
      },
      required: ["summary", "persona"]
    },
    positioning: {
        type: Type.OBJECT,
        properties: {
            statement: { type: Type.STRING },
            narrative: { type: Type.STRING }
        },
        required: ["statement", "narrative"]
    },
    landing_page_structure: {
        type: Type.OBJECT,
        properties: {
            sections: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
                    required: ["title", "description"]
                }
            },
            hero_example: {
                type: Type.OBJECT,
                properties: { headline: { type: Type.STRING }, subheadline: { type: Type.STRING }, cta: { type: Type.STRING } },
                required: ["headline", "subheadline", "cta"]
            }
        },
        required: ["sections", "hero_example"]
    },
    channel_strategy: {
        type: Type.OBJECT,
        properties: {
            channels: { type: Type.ARRAY, items: { type: Type.STRING } },
            test_first: { type: Type.STRING },
            reasoning: { type: Type.STRING }
        },
        required: ["channels", "test_first", "reasoning"]
    },
    launch_plan: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: { day: { type: Type.NUMBER }, content: { type: Type.STRING } },
            required: ["day", "content"]
        }
    },
    sample_assets: {
        type: Type.OBJECT,
        properties: {
            ads: { type: Type.ARRAY, items: adSchema },
            social: { type: Type.ARRAY, items: socialSchema },
            email: emailSchema
        },
        required: ["ads", "social", "email"]
    }
  },
  required: ["mode", "reasoning_log", "opportunity_scan", "icp", "positioning", "landing_page_structure", "channel_strategy", "launch_plan", "sample_assets"]
};

// --- Mode 3: Compare Schema ---
const compareSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, enum: ["compare"] },
    reasoning_log: { type: Type.ARRAY, items: { type: Type.STRING } },
    verdict: { type: Type.STRING },
    scoreboard: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING },
                score_a: { type: Type.NUMBER },
                score_b: { type: Type.NUMBER },
                winner: { type: Type.STRING, enum: ["A", "B", "Tie"] }
            },
            required: ["category", "score_a", "score_b", "winner"]
        }
    },
    social_intel: {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "Overview of social media activity or reputation found via search." },
            key_channels: { type: Type.ARRAY, items: { type: Type.STRING } },
            sentiment_analysis: { type: Type.STRING, description: "General sentiment of the brand/competitor online." }
        },
        required: ["summary", "key_channels", "sentiment_analysis"]
    },
    differences: {
        type: Type.OBJECT,
        properties: {
            b_better_points: { type: Type.ARRAY, items: { type: Type.STRING } },
            a_edge_points: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["b_better_points", "a_edge_points"]
    },
    action_plan: {
        type: Type.OBJECT,
        properties: {
            borrow_from_b: { type: Type.ARRAY, items: { type: Type.STRING } },
            lean_into_a: { type: Type.ARRAY, items: { type: Type.STRING } },
            revised_headline_a: { type: Type.STRING }
        },
        required: ["borrow_from_b", "lean_into_a"]
    }
  },
  required: ["mode", "reasoning_log", "verdict", "scoreboard", "social_intel", "differences", "action_plan"]
};


export const analyzeMarketingContent = async (
  mode: AppMode,
  inputs: { a: string, b: string }
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let prompt = "";
  let schema: Schema;

  if (mode === 'audit') {
    prompt = `Perform a deep conversion audit on the following landing page content.
    INPUT: "${inputs.a}"
    Provide strategic reasoning, find gaps (with severity), rewrite copy, and suggest ads.
    If the input contains URLs, use Google Search to gather context about the brand if needed.`;
    schema = auditSchema;
  } else if (mode === 'idea') {
    prompt = `Act as a GTM strategist. I have a product idea but no website.
    IDEA INPUT: "${inputs.a}"
    Create an opportunity scan, ICP, positioning, landing page structure, channel strategy, and launch plan.
    Use Google Search to validate market trends if specific industries are mentioned.`;
    schema = ideaSchema;
  } else {
    prompt = `Compare these two marketing assets.
    
    VARIANT A (My Product): "${inputs.a}"
    VARIANT B (Competitor(s)): "${inputs.b}"
    
    NOTE: Variant B may contain multiple competitors. Analyze them as a group or the strongest among them.
    
    TASKS:
    1. Provide a verdict and 0-10 scoreboard.
    2. USE GOOGLE SEARCH to research the social media presence (LinkedIn, Twitter, etc.) of the brands mentioned in the inputs.
    3. Summarize the social intelligence found (channels, sentiment).
    4. Analyze differences and create an action plan.`;
    schema = compareSchema;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: schema,
      tools: [{ googleSearch: {} }]
    },
  });

  if (!response.text) {
    throw new Error("No response generated from Gemini.");
  }

  try {
    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("Analysis failed: Invalid response format.");
  }
};
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION_BASE } from "../constants";
import { AnalysisResult, AppMode, MediaItem } from "../types";

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

const seoSuggestionSchema = {
    type: Type.OBJECT,
    properties: {
        current: { type: Type.STRING, description: "The current value found or 'None' if missing." },
        suggested: { type: Type.STRING, description: "An optimized version for better SEO and CTR." },
        reasoning: { type: Type.STRING, description: "Why this improvement helps." }
    },
    required: ["current", "suggested", "reasoning"]
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
        title_tag: seoSuggestionSchema,
        meta_description: seoSuggestionSchema,
        focus_keywords: {
            type: Type.OBJECT,
            properties: {
                current: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggested: { type: Type.ARRAY, items: { type: Type.STRING } },
                reasoning: { type: Type.STRING }
            },
            required: ["current", "suggested", "reasoning"]
        },
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
  inputs: { a: string, b: string, mediaA: MediaItem[], mediaB: MediaItem[] }
): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing in environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let prompt = "";
  let schema: Schema;
  const parts: any[] = [];

  // Helper to append media part from items
  const appendMediaItems = (items: MediaItem[]) => {
      items.forEach(item => {
        // Check image
        let match = item.data.match(/^data:(image\/[a-z]+);base64,(.+)$/);
        if (match) {
            parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            return;
        }
        // Check video
        match = item.data.match(/^data:(video\/[a-z0-9]+);base64,(.+)$/);
        if (match) {
            parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            return;
        }
      });
  };

  const hasImage = inputs.mediaA.some(m => m.type === 'image');
  const hasVideo = inputs.mediaA.some(m => m.type === 'video');

  if (mode === 'audit') {
    prompt = `Perform a deep conversion audit on the following landing page content.
    INPUT: "${inputs.a}"
    ${hasImage ? "NOTE: Image(s) of the landing page or ad have been provided. Analyze visual hierarchy, design trust signals, and alignment with the copy." : ""}
    ${hasVideo ? "NOTE: Video(s) of the landing page or user flow have been provided. Analyze user experience, motion design, and video content effectiveness." : ""}
    
    TASKS:
    1. Provide strategic reasoning, find gaps (with severity).
    2. Rewrite copy (headline, subhead, CTAs).
    3. Analyze SEO: Identify current title/meta (or say 'None' if missing), provide AI-optimized suggestions, and explain the reasoning. Suggest focus keywords.
    4. Suggest ad concepts.
    
    If the input contains URLs, use Google Search to gather context about the brand if needed.`;
    schema = auditSchema;
    
    appendMediaItems(inputs.mediaA);
    parts.push({ text: prompt });

  } else if (mode === 'idea') {
    prompt = `Act as a GTM strategist. I have a product idea but no website.
    IDEA INPUT: "${inputs.a}"
    ${hasImage ? "NOTE: Sketch/reference image(s) provided. Use to inform landing page structure and visual direction." : ""}
    ${hasVideo ? "NOTE: Video(s) explaining the idea or prototype demo provided. Use details to refine ICP and feature positioning." : ""}
    Create an opportunity scan, ICP, positioning, landing page structure, channel strategy, and launch plan.
    Use Google Search to validate market trends if specific industries are mentioned.`;
    schema = ideaSchema;

    appendMediaItems(inputs.mediaA);
    parts.push({ text: prompt });

  } else {
    // Compare Mode - complex interleaving
    schema = compareSchema;
    
    parts.push({ text: `Compare these two marketing assets.
    
    VARIANT A (My Product):
    - Text: "${inputs.a}"` });
    
    if (inputs.mediaA.length > 0) {
        parts.push({ text: `- ${inputs.mediaA.length} Visual attachment(s) for Variant A attached below.` });
        appendMediaItems(inputs.mediaA);
    }

    parts.push({ text: `\nVARIANT B (Competitor(s)):
    - Text: "${inputs.b}"` });

    if (inputs.mediaB.length > 0) {
        parts.push({ text: `- ${inputs.mediaB.length} Visual attachment(s) for Variant B attached below.` });
        appendMediaItems(inputs.mediaB);
    }

    parts.push({ text: `
    NOTE: Variant B may contain multiple competitors. Analyze them as a group or the strongest among them.
    
    TASKS:
    1. Provide a verdict and 0-10 scoreboard.
    2. USE GOOGLE SEARCH to research the social media presence (LinkedIn, Twitter, etc.) of the brands mentioned in the inputs.
    3. Summarize the social intelligence found (channels, sentiment).
    4. Analyze differences and create an action plan.
    `});
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [
      {
        role: "user",
        parts: parts,
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE,
      responseMimeType: "application/json",
      responseSchema: schema,
      tools: [{ googleSearch: {} }],
      // Enable thinking mode for complex reasoning
      thinkingConfig: { thinkingBudget: 32768 } 
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

export const generateStrategyAudio = async (text: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY is missing.");
    }
  
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Generate an enthusiastic, executive-level audio brief summarizing this strategy: ${text}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) {
        throw new Error("Failed to generate audio.");
    }
    
    return audioData;
}

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY is missing.");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Extract base64 if it comes with prefix, though usually passed raw or clean
    const cleanBase64 = base64Audio.includes('base64,') 
        ? base64Audio.split('base64,')[1] 
        : base64Audio;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: cleanBase64
                        }
                    },
                    { text: "Transcribe this audio clearly and accurately. Do not add any commentary, just return the text spoken." }
                ]
            }
        ]
    });

    return response.text || "";
}
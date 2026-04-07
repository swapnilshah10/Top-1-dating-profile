import { GoogleGenAI, Type } from '@google/genai';

export interface ProfileHighlight {
  textToHighlight: string;
  category: 'photo' | 'bio';
  color: 'green' | 'yellow' | 'red';
  before: string;
  after: string;
  explanation: string;
}

export interface ProfileAnalysis {
  matchScore: number;
  executiveConclusion: string;
  mustFixItems: string[];
  highlights: ProfileHighlight[];
}

export async function analyzeProfile(
  imageBase64: string,
  mimeType: string,
  bioText: string,
  customApiKey?: string
): Promise<ProfileAnalysis> {
  const apiKey = customApiKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY is not set. Please provide an API key to continue.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Analyze this dating profile and provide a "Top 1% Dating Profile Optimizer" analysis.

${bioText ? `Profile Bio / Prompts:\n${bioText}` : 'No bio text was provided — analyze the photo only.'}

Instructions:
1. Calculate a Match Score (0-100) based on photo quality, bio personality, authenticity, conversation-starter potential, and overall attraction signaling. Be realistic and balanced — don't be overly strict or overly generous.
2. Provide a candid "Profile Assessment": an honest, constructive summary of the profile's strengths and weaknesses from the perspective of what attracts quality matches.
3. Identify exactly 3 "Must-Fix" priority improvements that would have the biggest impact on match rates.
4. Identify 10-15 specific feedback highlights. For EACH highlight:
   - textToHighlight: If it's bio feedback, provide the EXACT substring from the bio text. If it's photo feedback, use an empty string "".
   - category: "photo" for photo-related feedback, "bio" for bio/text feedback.
   - color: "green" (strong/attractive element worth keeping), "yellow" (minor improvement opportunity), or "red" (significant issue hurting match rates).
   - before: Current state or description of the issue.
   - after: Specific suggested improvement.
   - explanation: Why this matters for attracting quality matches.

Focus feedback on: photo lighting & composition, smile & body language, setting & lifestyle signaling, bio personality & humor, specificity vs. generic statements, conversation-starter potential, avoiding clichés and red flags, and showcasing genuine interests authentically.`;
  console.log('Prompt:', prompt);
  const models = await ai.models.list();
  console.log('Model ' , models)
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.INTEGER, description: 'Match Score from 0 to 100' },
          executiveConclusion: { type: Type.STRING, description: 'Candid, constructive profile assessment' },
          mustFixItems: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Exactly 3 highest-impact improvements',
          },
          highlights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                textToHighlight: {
                  type: Type.STRING,
                  description: 'Exact substring from the bio text to highlight, or empty string for photo feedback',
                },
                category: {
                  type: Type.STRING,
                  enum: ['photo', 'bio'],
                  description: 'Whether this feedback is about the photo or the bio/text',
                },
                color: {
                  type: Type.STRING,
                  enum: ['green', 'yellow', 'red'],
                  description: 'Feedback severity color',
                },
                before: { type: Type.STRING, description: 'Current state or issue description' },
                after: { type: Type.STRING, description: 'Suggested improvement' },
                explanation: {
                  type: Type.STRING,
                  description: 'Why this matters for attracting quality matches',
                },
              },
              required: ['textToHighlight', 'category', 'color', 'before', 'after', 'explanation'],
            },
          },
        },
        required: ['matchScore', 'executiveConclusion', 'mustFixItems', 'highlights'],
      },
    },
  });

  const jsonStr = response.text?.trim() || '{}';
  try {
    return JSON.parse(jsonStr) as ProfileAnalysis;
  } catch (e) {
    console.error('Failed to parse JSON response', jsonStr);
    throw new Error('Failed to parse analysis results.');
  }
}

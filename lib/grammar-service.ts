import { OpenAI } from 'openai';
import { Suggestion } from '@/types/data-models';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface GrammarAnalysisResult {
  suggestions: Suggestion[];
  tone_analysis?: {
    formality: 'formal' | 'informal' | 'mixed';
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
}

interface GPTCorrection {
  start: number;
  end: number;
  suggestion: string;
  rule: string;
}

interface GPTResponse {
  corrections: GPTCorrection[];
}

export async function analyzeSentence(sentence: string, documentId: string): Promise<Suggestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional copy editor. Analyze the text for grammar, spelling, and style issues.
          Return ONLY valid JSON:
          {"corrections": [{"start":int,"end":int,"suggestion":string,"rule":string}]}`
        },
        {
          role: "user",
          content: sentence
        }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) return [];
      
      const result = JSON.parse(content) as GPTResponse;
      const now = new Date().toISOString();
      
      // Convert GPT corrections to our Suggestion format
      return result.corrections.map(correction => ({
        suggestion_id: uuidv4(),
        document_id: documentId,
        type: correction.rule.toLowerCase().includes('spell') ? 'spelling' : 'grammar',
        position: [correction.start, correction.end],
        alternatives: [correction.suggestion],
        explanation: correction.rule,
        confidence_score: 0.9, // GPT-4o-mini doesn't provide confidence scores
        created_at: now
      }));
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error analyzing sentence:', error);
    return [];
  }
}

export async function analyzeParagraphTone(paragraph: string): Promise<GrammarAnalysisResult['tone_analysis']> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional copy editor. Analyze the text for tone and formality.
          Return ONLY valid JSON:
          {"formality": "formal"|"informal"|"mixed", "sentiment": "positive"|"negative"|"neutral", "confidence": 0.9}`
        },
        {
          role: "user",
          content: paragraph
        }
      ],
      temperature: 0,
      response_format: { type: "json_object" }
    });

    try {
      const content = response.choices[0].message.content;
      if (!content) throw new Error('No content in response');
      
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return {
        formality: 'mixed',
        sentiment: 'neutral',
        confidence: 0
      };
    }
  } catch (error) {
    console.error('Error analyzing paragraph tone:', error);
    return {
      formality: 'mixed',
      sentiment: 'neutral',
      confidence: 0
    };
  }
}

export async function analyzeFullDocument(content: string, documentId: string): Promise<GrammarAnalysisResult> {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  const paragraphs = content.split('\n\n');
  
  const suggestions: Suggestion[] = [];
  let tone_analysis;
  
  // Analyze each sentence for grammar
  for (const sentence of sentences) {
    const sentenceSuggestions = await analyzeSentence(sentence.trim(), documentId);
    suggestions.push(...sentenceSuggestions);
  }
  
  // Analyze the first paragraph for tone (as a sample)
  if (paragraphs.length > 0) {
    tone_analysis = await analyzeParagraphTone(paragraphs[0]);
  }
  
  return {
    suggestions,
    tone_analysis
  };
} 
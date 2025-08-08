// AI Configuration for Akale Oru Istham
export const AI_CONFIG = {
  // Model selection (priority order)
  PREFERRED_PROVIDER: 'gemini', // 'gemini' | 'openai' | 'mock'
  
  // Gemini Configuration
  GEMINI: {
    MODEL: 'gemini-2.0-flash-exp', // Latest Gemini 2.0 Flash model
    API_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    GENERATION_CONFIG: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 800,
    },
    SAFETY_SETTINGS: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  },
  
  // OpenAI Configuration
  OPENAI: {
    MODEL: 'gpt-3.5-turbo',
    API_URL: 'https://api.openai.com/v1/chat/completions',
    GENERATION_CONFIG: {
      max_tokens: 800,
      temperature: 0.9,
    }
  }
};

// Available models for easy switching
export const AVAILABLE_MODELS = {
  // Gemini Models
  'gemini-2.0-flash-exp': 'Gemini 2.0 Flash (Experimental) - Latest and fastest',
  'gemini-1.5-flash': 'Gemini 1.5 Flash - Stable and reliable',
  'gemini-1.5-pro': 'Gemini 1.5 Pro - Most capable',
  
  // OpenAI Models
  'gpt-3.5-turbo': 'GPT-3.5 Turbo - Fast and cost-effective',
  'gpt-4': 'GPT-4 - Most capable OpenAI model',
  'gpt-4-turbo': 'GPT-4 Turbo - Latest GPT-4 variant'
};

export default AI_CONFIG;

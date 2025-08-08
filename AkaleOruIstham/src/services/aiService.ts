import { ObjectProfile } from '../types/ObjectProfile';
import { AI_PROMPT_TEMPLATE } from '../utils/prompts';
import Constants from 'expo-constants';

// Read from environment variables
const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const generateObjectProfile = async (
  objectName: string,
  location: string,
  vibe: string
): Promise<ObjectProfile> => {
  try {
    // Try OpenAI first if API key is available
    if (OPENAI_API_KEY) {
      return await generateWithOpenAI(objectName, location, vibe);
    }
    
    // Fallback to Gemini if available
    if (GEMINI_API_KEY) {
      return await generateWithGemini(objectName, location, vibe);
    }
    
    // Ultimate fallback to mock data
    console.warn('No AI API keys configured, using mock data');
    return generateMockProfile(objectName, location, vibe);
  } catch (error) {
    console.error('AI generation failed, using mock data:', error);
    return generateMockProfile(objectName, location, vibe);
  }
};

const generateWithOpenAI = async (
  objectName: string,
  location: string,
  vibe: string
): Promise<ObjectProfile> => {
  const prompt = AI_PROMPT_TEMPLATE
    .replace('{OBJECT_NAME}', objectName)
    .replace('{LOCATION}', location)
    .replace('{VIBE}', vibe)
    .replace('{CURRENT_TIME}', new Date().toLocaleString());

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const aiResponse = data.choices[0].message.content;
  
  try {
    const profile = JSON.parse(aiResponse);
    return {
      ...profile,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      createdBy: 'anonymous',
    };
  } catch (parseError) {
    throw new Error('Failed to parse AI response as JSON');
  }
};

const generateWithGemini = async (
  objectName: string,
  location: string,
  vibe: string
): Promise<ObjectProfile> => {
  // Implement Gemini API call similar to OpenAI
  // For now, fallback to mock
  return generateMockProfile(objectName, location, vibe);
};

const generateMockProfile = (
  objectName: string,
  location: string,
  vibe: string
): ObjectProfile => {
  const mockBios = [
    `Hey! I'm ${objectName}, a ${vibe} soul just vibing in ${location}. Looking for someone who appreciates the finer things in life... like existing.`,
    `${objectName} here! Been ${vibe} lately and thought I'd give this dating thing a try. Found me at ${location} living my best inanimate life.`,
    `Just a ${vibe} ${objectName} trying to find my person. Currently stationed at ${location} but willing to relocate for the right connection.`,
  ];

  const mockPassions = [
    ['staying still', 'collecting dust', 'being useful'],
    ['minimalism', 'vintage aesthetics', 'sustainability'],
    ['campus life', 'late night study sessions', 'coffee culture'],
    ['existential dread', 'people watching', 'silent conversations'],
  ];

  const mockAnthems = [
    { title: 'Mr. Brightside', artist: 'The Killers' },
    { title: 'Someone Like You', artist: 'Adele' },
    { title: 'Shake It Off', artist: 'Taylor Swift' },
    { title: 'Bohemian Rhapsody', artist: 'Queen' },
  ];

  const mockPrompts = [
    { question: "What's your ideal first date?", answer: "Somewhere quiet where we can just... be." },
    { question: "What's your biggest fear?", answer: "Being thrown away or forgotten." },
    { question: "What makes you unique?", answer: "I've seen things... campus things." },
  ];

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: objectName,
    bio: mockBios[Math.floor(Math.random() * mockBios.length)],
    passions: mockPassions[Math.floor(Math.random() * mockPassions.length)],
    prompt: mockPrompts[Math.floor(Math.random() * mockPrompts.length)],
    imageUrl: '',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      description: location,
    },
    vibe,
    createdAt: new Date(),
    createdBy: 'anonymous',
  };
};

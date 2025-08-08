import { ObjectProfile, ObjectCreationData } from '../types/ObjectProfile';
import { generatePrompt } from '../utils/prompts';

// This should be moved to environment variables in production
const OPENAI_API_KEY = 'your-openai-api-key';

export const generateObjectProfile = async (
  creationData: ObjectCreationData
): Promise<Partial<ObjectProfile> | null> => {
  try {
    const prompt = generatePrompt(
      creationData.objectName,
      creationData.location.description,
      creationData.vibe
    );

    // Using OpenAI API (you can replace with any other AI service)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a witty AI that creates dating profiles for inanimate objects. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const profileData = JSON.parse(aiResponse);

    return {
      name: profileData.name,
      age: profileData.age,
      bio: profileData.bio,
      anthem: profileData.anthem,
      passions: profileData.passions,
      prompt: profileData.prompt,
      imageUrl: creationData.imageUri,
      location: creationData.location,
      vibe: creationData.vibe,
      createdAt: new Date(),
      createdBy: 'anonymous' // Replace with actual user ID
    };

  } catch (error) {
    console.error('Error generating profile:', error);
    return null;
  }
};

// Mock function for development/testing when API key is not available
export const generateMockProfile = (
  creationData: ObjectCreationData
): Partial<ObjectProfile> => {
  const mockProfiles = {
    'chair': {
      name: 'Sitara the Supportive',
      age: '5 years young',
      bio: 'Been holding it down since 2019. Great at supporting others, literally. Looking for someone who appreciates stability and won\'t leave me hanging.',
      anthem: {
        title: 'Lean On Me',
        artist: 'Bill Withers'
      },
      passions: ['Supporting dreams', 'People watching', 'Posture improvement', 'Silent comfort'],
      prompt: {
        question: 'What\'s your love language?',
        answer: 'Physical touch - I\'m all about that support life 💺'
      }
    },
    'book': {
      name: 'Paige Turner',
      age: 'Timeless',
      bio: 'Full of stories and always ready to share. I\'ve got depth, plot twists, and a great cover. Swipe right if you\'re ready for an adventure between the lines.',
      anthem: {
        title: 'Story of My Life',
        artist: 'One Direction'
      },
      passions: ['Character development', 'Plot twists', 'Late night reading', 'Bookmarks'],
      prompt: {
        question: 'What\'s your ideal Sunday?',
        answer: 'Cozy corner, warm tea, and someone who reads me cover to cover 📚'
      }
    },
    'default': {
      name: `${creationData.objectName} the ${creationData.vibe}`,
      age: 'Young at heart',
      bio: `Living my best ${creationData.vibe} life at ${creationData.location.description}. Looking for someone who gets my vibe and won't judge my static lifestyle.`,
      anthem: {
        title: 'Good Vibes Only',
        artist: 'Various Artists'
      },
      passions: ['Existing gracefully', 'Vibe checking', 'Being useful', 'Campus life'],
      prompt: {
        question: 'What makes you unique?',
        answer: `I bring that ${creationData.vibe} energy wherever I go! ✨`
      }
    }
  };

  const profileKey = creationData.objectName.toLowerCase();
  const selectedProfile = mockProfiles[profileKey as keyof typeof mockProfiles] || mockProfiles.default;

  return {
    ...selectedProfile,
    imageUrl: creationData.imageUri,
    location: creationData.location,
    vibe: creationData.vibe,
    createdAt: new Date(),
    createdBy: 'anonymous'
  };
};

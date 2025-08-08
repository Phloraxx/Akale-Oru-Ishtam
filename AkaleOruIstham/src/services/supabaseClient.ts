import { createClient } from '@supabase/supabase-js';

// These should be moved to environment variables in production
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const uploadImage = async (uri: string, fileName: string): Promise<string | null> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const { data, error } = await supabase.storage
      .from('object-images')
      .upload(fileName, blob);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('object-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const saveObjectProfile = async (profile: any): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('objects')
      .insert([{
        name: profile.name,
        bio: profile.bio,
        passions: profile.passions,
        prompt_question: profile.prompt.question,
        prompt_answer: profile.prompt.answer,
        image_url: profile.imageUrl,
        location_description: profile.location.description,
        vibe: profile.vibe,
        created_by: 'anonymous' // Replace with actual user ID when auth is implemented
      }]);

    if (error) {
      console.error('Error saving profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

export const getObjectProfiles = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('objects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
};

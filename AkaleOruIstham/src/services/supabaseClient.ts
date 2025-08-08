import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { ObjectProfile } from '../types/ObjectProfile';

// Read from environment variables
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database operations
export const saveObjectProfile = async (profile: ObjectProfile): Promise<boolean> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('objects')
      .insert([
        {
          name: profile.name,
          bio: profile.bio,
          passions: profile.passions,
          prompt: profile.prompt,
          image_url: profile.imageUrl,
          vibe: profile.vibe,
          location: profile.location || {
            latitude: 0,
            longitude: 0,
            description: 'Unknown location'
          },
          created_by: user?.id || profile.createdBy || 'anonymous',
          user_email: user?.email || null,
        },
      ])
      .select();

    if (error) {
      console.error('Error saving profile:', error);
      return false;
    }

    console.log('Profile saved successfully:', data);
    return true;
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

export const fetchObjectProfiles = async (limit: number = 20): Promise<ObjectProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('objects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching profiles:', error);
      return [];
    }

    // Transform database records to ObjectProfile format
    return (data || []).map((record: any) => ({
      id: record.id,
      name: record.name,
      bio: record.bio,
      passions: record.passions || [],
      prompt: record.prompt || { question: '', answer: '' },
      imageUrl: record.image_url || '',
      vibe: record.vibe || 'mysterious',
      location: record.location || {
        latitude: 0,
        longitude: 0,
        description: 'Unknown location'
      },
      createdAt: new Date(record.created_at),
      createdBy: record.created_by || 'anonymous',
    }));
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
};

// Alias for backward compatibility
export const getObjectProfiles = fetchObjectProfiles;

// Authentication helpers
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getUserProfiles = async (userId?: string): Promise<ObjectProfile[]> => {
  try {
    if (!userId) {
      const user = await getCurrentUser();
      if (!user) return [];
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('objects')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user profiles:', error);
      return [];
    }

    // Transform database records to ObjectProfile format
    return (data || []).map((record: any) => ({
      id: record.id,
      name: record.name,
      bio: record.bio,
      passions: record.passions || [],
      prompt: record.prompt || { question: '', answer: '' },
      imageUrl: record.image_url || '',
      vibe: record.vibe || 'mysterious',
      location: record.location || {
        latitude: 0,
        longitude: 0,
        description: 'Unknown location'
      },
      createdAt: new Date(record.created_at),
      createdBy: record.created_by || 'anonymous',
    }));
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return [];
  }
};

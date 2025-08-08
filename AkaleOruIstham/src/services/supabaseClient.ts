import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { ObjectProfile } from '../types/ObjectProfile';

// Use environment variables for better security and flexibility
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fjlhbuqjaydqaqabympa.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbGhidXFqYXlkcWFxYWJ5bXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTczODIsImV4cCI6MjA3MDIzMzM4Mn0.vS6zfwJTFulOQJ3NWOfL5tltxiGDXJcDum3KW_D-qkg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Authentication helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Upload object image using the new logic
export const uploadObjectImage = async (imageUri: string, objectId: string): Promise<string | null> => {
  try {
    // Fetch the image from the URI
    const response = await fetch(imageUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const file = await response.blob();
    
    const timestamp = Date.now();
    const fileName = `object-${objectId}-${timestamp}.png`;
    const filePath = `public/${fileName}`;

    const { data, error } = await supabase
      .storage
      .from('object-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('object-images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    return publicUrl;
  } catch (error) {
    return null;
  }
};

// Database operations
export const saveObjectProfile = async (
  profile: ObjectProfile, 
  localImageUri?: string,
  options: { allowImageUploadFailure?: boolean } = {}
): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    let imageUrl = profile.imageUrl;
    
    if (localImageUri && localImageUri.startsWith('file://')) {
      const uploadedUrl = await uploadObjectImage(localImageUri, profile.id);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        if (!options.allowImageUploadFailure) {
          throw new Error('Image upload failed');
        }
      }
    }
    
    const dbRecord = {
      name: profile.name,
      bio: profile.bio,
      passions: profile.passions,
      prompt: profile.prompt,
      image_url: imageUrl,
      vibe: profile.vibe,
      location: profile.location || {
        latitude: 0,
        longitude: 0,
        description: 'Unknown location'
      },
      created_by: user?.id || profile.createdBy || 'anonymous',
      user_email: user?.email || null,
    };
    
    const { data, error } = await supabase
      .from('objects')
      .insert([dbRecord])
      .select();

    if (error) {
      throw new Error(`Failed to save profile: ${error.message}`);
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const fetchObjectProfiles = async (limit: number = 20): Promise<ObjectProfile[]> => {
  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

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
};

// Alias for backward compatibility
export const getObjectProfiles = fetchObjectProfiles;

export const getUserProfiles = async (userId?: string): Promise<ObjectProfile[]> => {
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
    return [];
  }

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
};

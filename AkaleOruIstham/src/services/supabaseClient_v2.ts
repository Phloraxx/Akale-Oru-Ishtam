import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { ObjectProfile } from '../types/ObjectProfile';

// Use environment variables for better security and flexibility
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://fjlhbuqjaydqaqabympa.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqbGhidXFqYXlkcWFxYWJ5bXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MDQxNjksImV4cCI6MjA0NzA4MDE2OX0.qFQNlGqSdnmgMKCJDG_KQDGl9TuT6XrJxhzJTZBJvxo';

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

// Fixed upload function using fetch to properly read file data
export const uploadObjectImage = async (imageUri: string, objectId: string): Promise<string | null> => {
  try {
    console.log('🖼️ Starting image upload...', { imageUri: imageUri.substring(0, 50) + '...', objectId });
    
    // Validate inputs
    if (!imageUri || !objectId) {
      throw new Error('Missing imageUri or objectId');
    }

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    console.log('👤 Current session:', session ? 'authenticated' : 'anonymous');

    console.log('📥 Processing image from URI...');
    let fileData: Blob;
    let contentType: string = 'image/jpeg';
    
    try {
      // Use fetch to read the file data - this works for both local and remote files
      console.log('📖 Reading file using fetch...');
      const response = await fetch(imageUri);
      
      if (!response.ok) {
        throw new Error(`Failed to read file: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob data
      fileData = await response.blob();
      console.log('📦 File blob created, size:', fileData.size, 'bytes');
      
      // Determine content type from response headers or URI
      contentType = response.headers.get('content-type') || 'image/jpeg';
      
      // If content type is not in headers, determine from URI
      if (contentType === 'application/octet-stream' || !contentType.startsWith('image/')) {
        if (imageUri.toLowerCase().includes('.png')) {
          contentType = 'image/png';
        } else if (imageUri.toLowerCase().includes('.gif')) {
          contentType = 'image/gif';
        } else if (imageUri.toLowerCase().includes('.webp')) {
          contentType = 'image/webp';
        } else {
          contentType = 'image/jpeg';
        }
      }
      
      console.log('📸 Final content type:', contentType);
      
      // Validate file size
      if (fileData.size === 0) {
        throw new Error('Image file is empty');
      }
      
      if (fileData.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('Image file is too large (max 50MB)');
      }
      
      console.log('✅ File successfully read and validated');
      
    } catch (fetchError) {
      console.error('❌ Failed to read file with fetch:', fetchError);
      throw new Error(`Cannot read file: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
    const timestamp = Date.now();
    const fileExtension = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `object-${objectId}-${timestamp}.${fileExtension}`;
    const filePath = `public/${fileName}`;
    
    console.log('📂 Upload path:', filePath);
    console.log('📤 About to upload file - size:', fileData.size, 'type:', contentType);

    // Upload to Supabase Storage
    console.log('⬆️ Uploading to Supabase storage...');
    const { data, error } = await supabase
      .storage
      .from('object-images')
      .upload(filePath, fileData, {
        cacheControl: '3600',
        upsert: false,
        contentType: contentType,
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    console.log('✅ Upload successful:', data);

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('object-images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;
    console.log('🌐 Public URL generated:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error('🚨 Image upload failed:', error);
    return null;
  }
};

// Enhanced saveObjectProfile with better error handling and logging
export const saveObjectProfile = async (
  profile: ObjectProfile, 
  localImageUri?: string,
  options: { allowImageUploadFailure?: boolean } = {}
): Promise<boolean> => {
  try {
    console.log('💾 Starting profile save...', { profileId: profile.id, hasImage: !!localImageUri });
    
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Current user:', user ? user.email || user.id : 'anonymous');
    
    let imageUrl = profile.imageUrl;
    
    // Handle image upload if local image is provided
    if (localImageUri && localImageUri.startsWith('file://')) {
      console.log('🖼️ Processing local image upload...');
      const uploadedUrl = await uploadObjectImage(localImageUri, profile.id);
      
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
        console.log('✅ Image uploaded successfully:', uploadedUrl);
      } else {
        console.warn('⚠️ Image upload failed');
        if (!options.allowImageUploadFailure) {
          throw new Error('Image upload failed');
        }
        console.log('📝 Continuing without image due to allowImageUploadFailure option');
      }
    }
    
    // Prepare database record
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
    };
    
    console.log('📄 Database record prepared:', { 
      name: dbRecord.name, 
      hasImage: !!dbRecord.image_url,
      createdBy: dbRecord.created_by 
    });

    // Insert into database
    console.log('💾 Inserting into database...');
    const { data, error } = await supabase
      .from('objects')
      .insert([dbRecord])
      .select();

    if (error) {
      console.error('❌ Database error:', error);
      throw new Error(`Failed to save profile: ${error.message}`);
    }
    
    console.log('✅ Profile saved successfully:', data);
    return true;
  } catch (error) {
    console.error('🚨 Save profile failed:', error);
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
    console.error('Error fetching profiles:', error);
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
    console.error('Error fetching user profiles:', error);
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

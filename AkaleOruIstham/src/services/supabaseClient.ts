import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { ObjectProfile } from '../types/ObjectProfile';

// Read from environment variables
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

// Log all Supabase configuration details
console.log('🔧 SUPABASE CLIENT INITIALIZATION:');
console.log('================================');
console.log('📍 Supabase URL:', SUPABASE_URL);
console.log('🔑 Anon Key (first 20 chars):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
console.log('🔑 Anon Key (last 10 chars):', '...' + SUPABASE_ANON_KEY.substring(SUPABASE_ANON_KEY.length - 10));
console.log('📦 Client initialized at:', new Date().toISOString());
console.log('================================');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Test Supabase connectivity
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Testing Supabase connection...');
    console.log('Supabase URL:', SUPABASE_URL);
    console.log('Using anon key:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'Missing');
    
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth test result:', { user: user?.id || 'none', error: authError?.message || 'none' });
    
    // Test storage connection with detailed logging
    console.log('Testing storage access...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('Storage error details:', {
        message: storageError.message,
        name: storageError.name,
        statusCode: (storageError as any).statusCode,
        details: storageError
      });
      return { success: false, message: `Storage test failed: ${storageError.message}` };
    }
    
    console.log('Storage buckets found:', buckets?.map(b => ({ name: b.name, public: b.public })));
    
    // Check if object-images bucket exists
    const objectImagesBucket = buckets?.find(bucket => bucket.name === 'object-images');
    console.log('object-images bucket search result:', objectImagesBucket);
    
    if (!objectImagesBucket) {
      const bucketNames = buckets?.map(b => b.name).join(', ') || 'none';
      return { 
        success: false, 
        message: `Storage bucket "object-images" not found. Available buckets: ${bucketNames}. Please create the bucket in Supabase Dashboard → Storage.` 
      };
    }
    
    // Test bucket access by trying to list files
    console.log('Testing bucket access...');
    const { data: files, error: listError } = await supabase.storage
      .from('object-images')
      .list('', { limit: 1 });
    
    if (listError) {
      console.error('Bucket access error:', listError);
      return {
        success: false,
        message: `Bucket exists but access failed: ${listError.message}. Check storage policies.`
      };
    }
    
    console.log('Bucket access test successful, files in bucket:', files?.length || 0);
    
    return { 
      success: true, 
      message: `✅ Connection successful!\n• Found ${buckets?.length || 0} storage buckets\n• object-images bucket: ${objectImagesBucket.public ? 'Public' : 'Private'}\n• Files in bucket: ${files?.length || 0}\n• Auth status: ${user ? 'Signed in' : 'Anonymous'}` 
    };
  } catch (error) {
    console.error('Supabase connection test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      message: `❌ Connection failed: ${errorMessage}\n\nCheck:\n• Internet connection\n• Supabase URL/key in .env\n• Bucket exists and is public` 
    };
  }
};

// Detailed diagnostics function
export const runDetailedDiagnostics = async (): Promise<string> => {
  const results: string[] = [];
  
  try {
    results.push('🔍 SUPABASE DIAGNOSTICS REPORT');
    results.push('================================');
    
    // 1. Environment Check
    results.push('\n📋 ENVIRONMENT CHECK:');
    results.push(`• Supabase URL: ${SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    results.push(`• Anon Key: ${SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
    if (SUPABASE_URL) results.push(`• URL: ${SUPABASE_URL}`);
    
    // 2. Basic Connection Test
    results.push('\n🌐 CONNECTION TEST:');
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError && !authError.message.includes('session')) {
        results.push(`❌ Auth connection failed: ${authError.message}`);
      } else {
        results.push('✅ Auth connection successful');
        results.push(`• User: ${user ? user.email || user.id : 'Anonymous'}`);
      }
    } catch (error) {
      results.push(`❌ Auth connection error: ${error}`);
    }
    
    // 3. Storage Connection Test
    results.push('\n💾 STORAGE TEST:');
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      if (storageError) {
        results.push(`❌ Storage connection failed: ${storageError.message}`);
        results.push(`• Error details: ${JSON.stringify(storageError, null, 2)}`);
        return results.join('\n');
      }
      
      results.push('✅ Storage connection successful');
      results.push(`• Total buckets: ${buckets?.length || 0}`);
      
      if (buckets && buckets.length > 0) {
        results.push('• Available buckets:');
        buckets.forEach(bucket => {
          results.push(`  - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
        });
      }
      
      // 4. Specific Bucket Test
      results.push('\n🗂️ OBJECT-IMAGES BUCKET TEST:');
      const objectImagesBucket = buckets?.find(bucket => bucket.name === 'object-images');
      
      if (!objectImagesBucket) {
        results.push('❌ object-images bucket NOT FOUND');
        results.push('• ACTION REQUIRED: Create bucket in Supabase Dashboard');
        results.push('• Go to: Dashboard → Storage → Create Bucket');
        results.push('• Name: object-images');
        results.push('• Public: Yes');
        return results.join('\n');
      }
      
      results.push('✅ object-images bucket found');
      results.push(`• Public: ${objectImagesBucket.public ? 'Yes' : 'No'}`);
      results.push(`• Created: ${objectImagesBucket.created_at}`);
      
      // 5. Bucket Access Test
      results.push('\n🔐 BUCKET ACCESS TEST:');
      const { data: files, error: listError } = await supabase.storage
        .from('object-images')
        .list('', { limit: 1 });
      
      if (listError) {
        results.push(`❌ Bucket access failed: ${listError.message}`);
        results.push('• ACTION REQUIRED: Check storage policies');
        results.push('• Recommended policy:');
        results.push('  CREATE POLICY "Public access" ON storage.objects');
        results.push('  FOR ALL USING (bucket_id = \'object-images\');');
        return results.join('\n');
      }
      
      results.push('✅ Bucket access successful');
      results.push(`• Files in bucket: ${files?.length || 0}`);
      
      // 6. Upload Test (if possible)
      results.push('\n📤 UPLOAD TEST:');
      try {
        // Create a tiny test file
        const testBlob = new Blob(['test'], { type: 'text/plain' });
        const testPath = `test-${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('object-images')
          .upload(testPath, testBlob);
        
        if (uploadError) {
          results.push(`❌ Upload test failed: ${uploadError.message}`);
        } else {
          results.push('✅ Upload test successful');
          results.push(`• Test file uploaded: ${uploadData.path}`);
          
          // Clean up test file
          await supabase.storage.from('object-images').remove([testPath]);
          results.push('• Test file cleaned up');
        }
      } catch (uploadError) {
        results.push(`❌ Upload test error: ${uploadError}`);
      }
      
    } catch (error) {
      results.push(`❌ Storage test error: ${error}`);
    }
    
    results.push('\n✅ DIAGNOSTICS COMPLETE');
    
  } catch (error) {
    results.push(`\n❌ DIAGNOSTICS FAILED: ${error}`);
  }
  
  return results.join('\n');
};

// Image upload function
export const uploadObjectImage = async (imageUri: string, objectId: string): Promise<string | null> => {
  try {
    console.log('📤 SUPABASE IMAGE UPLOAD START:');
    console.log('===============================');
    console.log('🆔 Object ID:', objectId);
    console.log('📱 Image URI:', imageUri);
    console.log('⏰ Upload started at:', new Date().toISOString());
    
    // Test Supabase connection first
    try {
      console.log('🔍 Testing Supabase storage connection...');
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('❌ SUPABASE BUCKET LIST ERROR:', {
          message: bucketsError.message,
          name: bucketsError.name,
          statusCode: (bucketsError as any).statusCode,
          details: bucketsError
        });
        throw new Error(`Supabase connection failed: ${bucketsError.message}`);
      }
      
      console.log('✅ Supabase storage connection successful');
      console.log('📦 Available buckets:', buckets?.map(b => ({ name: b.name, public: b.public })));
      
      // Check if object-images bucket exists
      const objectImagesBucket = buckets?.find(bucket => bucket.name === 'object-images');
      if (!objectImagesBucket) {
        console.error('❌ BUCKET NOT FOUND: object-images bucket does not exist');
        throw new Error('Storage bucket "object-images" does not exist. Please create it in Supabase Dashboard.');
      }
      console.log('✅ object-images bucket found:', {
        name: objectImagesBucket.name,
        public: objectImagesBucket.public,
        created_at: objectImagesBucket.created_at
      });
    } catch (connectionError) {
      console.error('❌ SUPABASE CONNECTION TEST FAILED:', connectionError);
      throw connectionError;
    }
    
    // Convert image URI to blob
    console.log('🔄 Converting image URI to blob...');
    const response = await fetch(imageUri);
    if (!response.ok) {
      console.error('❌ IMAGE FETCH FAILED:', {
        status: response.status,
        statusText: response.statusText,
        url: imageUri
      });
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('✅ Image blob created successfully:', {
      size: blob.size,
      type: blob.type,
      sizeKB: Math.round(blob.size / 1024),
      sizeMB: (blob.size / (1024 * 1024)).toFixed(2)
    });
    
    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (blob.size > maxSize) {
      console.error('❌ FILE TOO LARGE:', {
        actualSize: blob.size,
        maxSize: maxSize,
        actualSizeMB: (blob.size / (1024 * 1024)).toFixed(2),
        maxSizeMB: (maxSize / (1024 * 1024)).toFixed(2)
      });
      throw new Error('Image is too large. Please use an image smaller than 5MB.');
    }
    
    // Create a unique filename
    const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `object-${objectId}-${Date.now()}.${fileExt}`;
    const filePath = `object-images/${fileName}`;
    
    console.log('📝 Upload details:', {
      fileName: fileName,
      filePath: filePath,
      fileExtension: fileExt,
      contentType: blob.type || `image/${fileExt}`
    });
    
    // Try uploading with detailed error logging
    console.log('🚀 Starting Supabase storage upload...');
    const uploadStartTime = Date.now();
    
    const { data, error } = await supabase.storage
      .from('object-images')
      .upload(filePath, blob, {
        contentType: blob.type || `image/${fileExt}`,
        upsert: false
      });

    const uploadDuration = Date.now() - uploadStartTime;
    console.log(`⏱️ Upload attempt completed in ${uploadDuration}ms`);

    if (error) {
      console.error('❌ SUPABASE UPLOAD ERROR:', {
        message: error.message,
        name: error.name,
        statusCode: (error as any).statusCode,
        details: error,
        uploadDuration: uploadDuration
      });
      
      if (error.message.includes('Bucket not found')) {
        throw new Error('Storage bucket "object-images" not found. Please create it in Supabase Dashboard → Storage.');
      } else if (error.message.includes('Policy')) {
        throw new Error('Not authorized to upload images. Please check storage policies in Supabase Dashboard.');
      } else if (error.message.includes('Network')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }

    console.log('✅ SUPABASE UPLOAD SUCCESSFUL:', {
      uploadData: data,
      filePath: data?.path,
      uploadDuration: uploadDuration
    });

    // Get the public URL
    console.log('🔗 Generating public URL...');
    const { data: publicUrlData } = supabase.storage
      .from('object-images')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;
    console.log('✅ PUBLIC URL GENERATED:', {
      publicUrl: publicUrl,
      bucket: 'object-images',
      path: filePath
    });
    
    // Test if the URL is accessible
    try {
      console.log('🔍 Testing URL accessibility...');
      const testResponse = await fetch(publicUrl, { method: 'HEAD' });
      console.log('✅ URL ACCESSIBILITY TEST:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        accessible: testResponse.ok
      });
    } catch (testError) {
      console.warn('⚠️ URL ACCESSIBILITY TEST FAILED:', testError);
    }
    
    console.log('🎉 IMAGE UPLOAD COMPLETED SUCCESSFULLY');
    console.log('===============================');
    
    return publicUrl;
  } catch (error) {
    console.error('💥 COMPLETE UPLOAD ERROR:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    console.log('===============================');
    
    // Re-throw with more specific error messages
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error occurred during image upload');
    }
  }
};

// Database operations
export const saveObjectProfile = async (
  profile: ObjectProfile, 
  localImageUri?: string,
  options: { allowImageUploadFailure?: boolean } = {}
): Promise<boolean> => {
  try {
    console.log('💾 SUPABASE PROFILE SAVE START:');
    console.log('===============================');
    console.log('📝 Profile to save:', {
      id: profile.id,
      name: profile.name,
      bio: profile.bio?.substring(0, 50) + '...',
      vibe: profile.vibe,
      hasLocalImage: !!localImageUri,
      localImageUri: localImageUri
    });
    console.log('⚙️ Save options:', options);
    
    // Get the current user
    console.log('👤 Getting current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ USER FETCH ERROR:', userError);
    } else {
      console.log('✅ Current user:', {
        id: user?.id || 'none',
        email: user?.email || 'none',
        isAnonymous: !user
      });
    }
    
    let imageUrl = profile.imageUrl;
    
    // Upload image if local URI is provided
    if (localImageUri && localImageUri.startsWith('file://')) {
      console.log('📤 Starting image upload process...');
      try {
        const uploadedUrl = await uploadObjectImage(localImageUri, profile.id);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('✅ Image upload successful, updated imageUrl:', imageUrl);
        }
      } catch (uploadError) {
        console.error('❌ IMAGE UPLOAD FAILED:', uploadError);
        
        if (options.allowImageUploadFailure) {
          console.log('⚠️ Continuing with profile save despite image upload failure...');
          // Keep the local image URI or use a placeholder
          imageUrl = localImageUri;
        } else {
          console.log('🛑 Stopping profile save due to image upload failure');
          // Re-throw the error so the UI can handle it
          throw uploadError;
        }
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
      user_email: user?.email || null,
    };
    
    console.log('💾 Database record to insert:', {
      ...dbRecord,
      bio: dbRecord.bio?.substring(0, 50) + '...',
      image_url: dbRecord.image_url ? 'Set (' + dbRecord.image_url.length + ' chars)' : 'Not set'
    });
    
    console.log('🚀 Inserting record into Supabase...');
    const insertStartTime = Date.now();
    
    const { data, error } = await supabase
      .from('objects')
      .insert([dbRecord])
      .select();

    const insertDuration = Date.now() - insertStartTime;
    console.log(`⏱️ Database insert completed in ${insertDuration}ms`);

    if (error) {
      console.error('❌ SUPABASE DATABASE ERROR:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        insertDuration: insertDuration
      });
      throw new Error(`Failed to save profile: ${error.message}`);
    }

    console.log('✅ PROFILE SAVED SUCCESSFULLY:', {
      insertedData: data,
      recordCount: data?.length || 0,
      insertDuration: insertDuration
    });
    console.log('🎉 SUPABASE PROFILE SAVE COMPLETED');
    console.log('===============================');
    
    return true;
  } catch (error) {
    console.error('💥 COMPLETE PROFILE SAVE ERROR:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    console.log('===============================');
    throw error; // Re-throw so the UI can handle it
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


import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/sonner';

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param bucketName The name of the bucket to upload to
 * @param folderPath Optional folder path within the bucket
 * @returns URL to the uploaded file or null if upload failed
 */
export const uploadFile = async (
  file: File,
  bucketName: string = 'crop-images',
  folderPath: string = ''
): Promise<string | null> => {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error('Failed to upload image: ' + uploadError.message);
      return null;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error: any) {
    console.error('Error in file upload:', error);
    toast.error('Failed to upload image: ' + error.message);
    return null;
  }
};

/**
 * Delete a file from Supabase Storage
 * @param fileUrl The full URL of the file to delete
 * @param bucketName The name of the bucket where the file is stored
 * @returns boolean indicating success
 */
export const deleteFile = async (
  fileUrl: string,
  bucketName: string = 'crop-images'
): Promise<boolean> => {
  try {
    // Extract the file path from the URL
    const urlParts = fileUrl.split(`/${bucketName}/`);
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];
    
    // Delete the file
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete image: ' + error.message);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Error deleting file:', error);
    toast.error('Failed to delete image: ' + error.message);
    return false;
  }
};

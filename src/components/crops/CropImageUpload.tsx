
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from '@/components/ui/sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '@/utils/fileUtils';
import { addCropImage } from '@/utils/cropUtils';
import { CropImage } from '@/types';

interface CropImageUploadProps {
  cropId: string;
  onImageAdded: (image: CropImage) => void;
  onCancel: () => void;
}

const CropImageUpload: React.FC<CropImageUploadProps> = ({
  cropId,
  onImageAdded,
  onCancel
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [captureDate, setCaptureDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select an image to upload');
      return;
    }
    
    if (!captureDate) {
      toast.error('Please select a capture date');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload file to Supabase Storage
      const folderPath = `crops/${cropId}`;
      const imageUrl = await uploadFile(selectedFile, 'crop-images', folderPath);
      
      if (!imageUrl) {
        toast.error('Failed to upload image');
        setIsUploading(false);
        return;
      }
      
      // Add image record to database
      const cropImage = await addCropImage(cropId, imageUrl, captureDate, notes);
      
      if (cropImage) {
        onImageAdded(cropImage);
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="captureDate">Date Photo Taken</Label>
        <DatePicker
          selected={captureDate}
          onSelect={setCaptureDate}
          placeholder="Select date"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="imageFile">Crop Image</Label>
        {!preview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
            <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">Upload a photo of your crop</p>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="max-w-xs"
            />
          </div>
        ) : (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-48 rounded-md mx-auto" 
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add notes about the crop's growth, conditions, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedFile || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      </div>
    </form>
  );
};

export default CropImageUpload;

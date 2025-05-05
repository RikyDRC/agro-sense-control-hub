
import React from 'react';
import { 
  Separator 
} from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calendar, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { CropImage } from '@/types';
import { deleteCropImage } from '@/utils/cropUtils';
import { deleteFile } from '@/utils/fileUtils';

interface CropGrowthTimelineProps {
  images: CropImage[];
  onAddImage: () => void;
  onImageDeleted: (imageId: string) => void;
}

const CropGrowthTimeline: React.FC<CropGrowthTimelineProps> = ({
  images,
  onAddImage,
  onImageDeleted
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const handleDeleteImage = async (image: CropImage) => {
    if (confirm("Are you sure you want to delete this image?")) {
      // First delete the file from storage
      if (image.imageUrl) {
        await deleteFile(image.imageUrl);
      }
      
      // Then delete the DB record
      const success = await deleteCropImage(image.id);
      if (success) {
        onImageDeleted(image.id);
      }
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-10">
        <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">No growth images yet</h3>
        <p className="text-gray-500 mb-4">
          Track your crop's growth by adding images over time
        </p>
        <Button onClick={onAddImage}>
          <Plus className="h-4 w-4 mr-2" /> Add First Image
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Growth Timeline</h3>
        <Button size="sm" onClick={onAddImage}>
          <Plus className="h-4 w-4 mr-2" /> Add Image
        </Button>
      </div>
      
      <div className="space-y-8">
        {images.map((image, index) => (
          <div key={image.id} className="relative">
            {index > 0 && (
              <div className="absolute top-0 bottom-0 left-[19px] -ml-px w-0.5 bg-gray-200 z-0" />
            )}
            <div className="relative flex items-start space-x-4">
              <div className="bg-gray-100 rounded-full p-1 flex-shrink-0 z-10">
                <Calendar className="h-8 w-8 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-medium">
                      {formatDate(image.captureDate)}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-red-500"
                      onClick={() => handleDeleteImage(image)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="rounded-md overflow-hidden mb-2">
                    <img 
                      src={image.imageUrl} 
                      alt={`Crop on ${formatDate(image.captureDate)}`}
                      className="w-full object-cover h-auto max-h-72"
                    />
                  </div>
                  
                  {image.notes && (
                    <p className="text-sm text-gray-600 italic">{image.notes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CropGrowthTimeline;

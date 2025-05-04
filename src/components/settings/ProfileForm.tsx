
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Save, UserIcon, Camera, Loader2, AlertCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileFormProps {
  profile: UserProfile;
  refreshProfile: () => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ profile, refreshProfile }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [formData, setFormData] = useState({
    displayName: '',
    farmName: 'Green Valley Farm',
    location: 'California, USA',
    language: 'en-US',
    profileImage: ''
  });
  
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        displayName: profile.display_name || '',
        profileImage: profile.profile_image || '',
      }));
    }
  }, [profile]);
  
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [field]: e.target.value
    });
  };
  
  const handleSelectChange = (field: string) => (value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  
  // Modified update profile function to be more robust
  const handleUpdateProfile = async () => {
    if (!profile) {
      // Try to get the user ID from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Could not identify the current user');
        return;
      }
      
      // Try to create a new profile if one doesn't exist
      setLoading(true);
      
      try {
        // First check if a profile already exists to prevent duplicates
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (existingProfile) {
          // Update existing profile
          const { error } = await supabase
            .from('user_profiles')
            .update({
              display_name: formData.displayName,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          if (error) throw error;
        } else {
          // Create new profile
          const { error } = await supabase
            .from('user_profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              display_name: formData.displayName,
              role: 'farmer', // Default role
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
        }
        
        await refreshProfile();
        toast.success('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: formData.displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Improved image upload function
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile) {
      // Try to get user ID directly from auth if profile is not available
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You need to be logged in to upload a profile image');
        return;
      }
    }
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    
    setUploadingImage(true);
    
    try {
      // For this demo, we'll use a simple base64 encoding
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (!event.target?.result) return;
        
        const base64Image = event.target.result as string;
        const userId = profile?.id || (await supabase.auth.getUser()).data.user?.id;
        
        if (!userId) {
          throw new Error('User ID not found');
        }
        
        // Save profile image URL to user profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            profile_image: base64Image,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (error) throw error;
        
        setFormData(prev => ({
          ...prev,
          profileImage: base64Image
        }));
        
        await refreshProfile();
        toast.success('Profile image updated successfully');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  // Add retry mechanism for profile loading
  const handleRetryProfileLoad = () => {
    setRetryCount(prev => prev + 1);
    refreshProfile().then(() => {
      toast.success('Profile refreshed successfully');
    }).catch(err => {
      console.error('Error refreshing profile:', err);
      toast.error('Failed to refresh profile');
    });
  };

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" /> User Profile
          </CardTitle>
          <CardDescription>
            Profile information is currently unavailable
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>
                We're having trouble loading your complete profile information. 
                You can still update your display name below.
              </p>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName" 
                    value={formData.displayName} 
                    onChange={handleInputChange('displayName')}
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleRetryProfileLoad}>
            Retry Loading Profile
          </Button>
          <Button onClick={handleUpdateProfile} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" /> User Profile
          <Badge 
            className={
              profile.role === 'super_admin' ? 'bg-red-500' :
              profile.role === 'admin' ? 'bg-blue-500' : 
              'bg-green-500'
            }
          >
            {profile.role.replace('_', ' ')}
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage your personal information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              {formData.profileImage ? (
                <AvatarImage src={formData.profileImage} alt={formData.displayName || "User"} />
              ) : (
                <AvatarFallback className="bg-primary text-white text-xl">
                  {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <label 
              htmlFor="profile-image-upload" 
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90"
            >
              {uploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </label>
            <input 
              id="profile-image-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
          </div>
          
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={formData.displayName} 
                  onChange={handleInputChange('displayName')} 
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={profile.email} 
                  disabled
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="farmName">Farm Name</Label>
                <Input 
                  id="farmName" 
                  value={formData.farmName} 
                  onChange={handleInputChange('farmName')} 
                  placeholder="Enter farm name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location} 
                  onChange={handleInputChange('location')} 
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>
        </div>
          
        <Separator />
          
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">User Role</Label>
            <Input
              id="role"
              value={profile.role.replace('_', ' ')}
              disabled
              className="capitalize"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {profile.role === 'super_admin' ? 
                'You have full system administration privileges' : 
                'Contact a super admin to change roles'}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={formData.language} 
              onValueChange={handleSelectChange('language')}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
                <SelectItem value="fr-FR">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleUpdateProfile} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileForm;

'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Edit } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { ProfileWithStats } from '@/types';
import { EditProfileModal } from './EditProfileModal';

interface ProfileHeaderProps {
  profile: ProfileWithStats;
  onProfileUpdated?: () => void;
}

export function ProfileHeader({ profile, onProfileUpdated }: ProfileHeaderProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const currentUser = useAuthStore((state) => state.user);
  const [isFollowing, setIsFollowing] = useState(profile.is_following || false);
  const [followersCount, setFollowersCount] = useState(profile.followers_count);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser?.id === profile.id;

  const handleFollow = async () => {
    if (!currentUser) return;

    setIsUpdating(true);

    try {
      if (isFollowing) {
     
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('following_id', profile.id);

        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);

        toast({
          title: 'Success',
          description: `Unfollowed ${profile.username}`,
        });
      } else {
       
        await supabase.from('follows').insert({
          follower_id: currentUser.id,
          following_id: profile.id,
        });

        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);

       
        await supabase.from('notifications').insert({
          user_id: profile.id,
          actor_id: currentUser.id,
          type: 'follow',
        });

        toast({
          title: 'Success',
          description: `Following ${profile.username}`,
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files?.[0]) return;

    const file = e.target.files[0];

    
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Only JPEG and PNG images are allowed',
      });
      return;
    }


    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB',
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/avatar-${Date.now()}.${fileExt}`;

  
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

   
      const {
        data: { publicUrl },
      } = supabase.storage.from('posts').getPublicUrl(fileName);

   
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Avatar updated successfully',
      });

      onProfileUpdated?.();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload avatar',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files?.[0]) return;

    const file = e.target.files[0];

   
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Only JPEG and PNG images are allowed',
      });
      return;
    }

   
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 5MB',
      });
      return;
    }

    setIsUploadingCover(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/cover-${Date.now()}.${fileExt}`;

    
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

    
      const {
        data: { publicUrl },
      } = supabase.storage.from('posts').getPublicUrl(fileName);

     
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ cover_url: publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Cover image updated successfully',
      });

      onProfileUpdated?.();
    } catch (error: any) {
      console.error('Error uploading cover:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload cover image',
      });
    } finally {
      setIsUploadingCover(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      
        <div className="relative h-48 bg-gradient-to-r from-[#F59E0B] to-[#D97706]">
          {profile.cover_url && (
            <Image
              src={profile.cover_url}
              alt="Cover"
              fill
              className="object-cover"
            />
          )}
          {isOwnProfile && (
            <>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleCoverUpload}
                className="hidden"
              />
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploadingCover}
                className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <Camera className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            </>
          )}
        </div>

     
        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-4">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
                <AvatarFallback className="bg-[#F59E0B] text-white text-4xl">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute bottom-0 right-0 p-2 bg-[#F59E0B] rounded-full text-white hover:bg-[#D97706] transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 sm:mt-0">
              {isOwnProfile ? (
                <Button
                  variant="secondary"
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full sm:w-auto"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  disabled={isUpdating}
                  className="w-full sm:w-auto"
                  variant={isFollowing ? 'secondary' : 'default'}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {profile.first_name && profile.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : profile.username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
            {profile.bio && (
              <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
            )}
            {profile.location && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                📍 {profile.location}
              </p>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#F59E0B] hover:underline"
              >
                🔗 {profile.website}
              </a>
            )}
          </div>

   
          <div className="flex gap-8 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {followersCount}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.following_count}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Followings</p>
            </div>
          </div>
        </div>
      </div>

     
      <EditProfileModal
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={onProfileUpdated}
      />
    </>
  );
}
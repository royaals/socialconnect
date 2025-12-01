'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image as ImageIcon, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { createPostSchema, type CreatePostInput } from '@/lib/validations/post';
import Image from 'next/image';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
  });

  const content = watch('content');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Only JPEG and PNG images are allowed',
      });
      return;
    }

  
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'Image size must be less than 2MB',
      });
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: CreatePostInput) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a post',
      });
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl: string | null = null;

 
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        console.log('Uploading to:', fileName);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, selectedFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        console.log('Upload successful:', uploadData);

        
        const {
          data: { publicUrl },
        } = supabase.storage.from('posts').getPublicUrl(fileName);

        imageUrl = publicUrl;
        console.log('Public URL:', publicUrl);
      }

      
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: data.content,
          image_url: imageUrl,
          category: data.category || 'general',
        })
        .select()
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        throw new Error(`Post creation failed: ${postError.message}`);
      }

      console.log('Post created:', postData);

      toast({
        title: 'Success',
        description: 'Post created successfully',
      });

      reset();
      handleRemoveImage();
      onPostCreated?.();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create post',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarImage src={user?.avatar_url || ''} alt={user?.username} />
            <AvatarFallback className="bg-[#F59E0B] text-white">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              placeholder="Share what you are thinking..."
              className="min-h-[80px] resize-none border-0 focus:ring-0 text-base"
              {...register('content')}
              disabled={isLoading}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">
                {errors.content.message}
              </p>
            )}
            {content && (
              <p className="text-xs text-gray-500 mt-1">
                {content.length}/280 characters
              </p>
            )}
          </div>
        </div>

       
        {imagePreview && (
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={imagePreview}
              alt="Preview"
              width={600}
              height={400}
              className="w-full h-auto max-h-96 object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute top-2 left-2 px-3 py-1 bg-white/90 dark:bg-gray-800/90 rounded-full text-sm">
              Preview
            </div>
          </div>
        )}


        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <ImageIcon className="w-5 h-5 text-[#F59E0B]" />
              Image
            </button>
          
          </div>

          <Button type="submit" disabled={isLoading || !content?.trim()} size="lg">
            {isLoading ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}
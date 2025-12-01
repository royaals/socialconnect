'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { updatePostSchema, type UpdatePostInput} from '@/lib/validations/post';
import { PostWithAuthor } from '@/types';

interface EditPostModalProps {
  post: PostWithAuthor;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated?: () => void;
}

export function EditPostModal({
  post,
  isOpen,
  onClose,
  onPostUpdated,
}: EditPostModalProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdatePostInput>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      content: post.content,
      category: post.category,
    },
  });

  const content = watch('content');

  const onSubmit = async (data: UpdatePostInput) => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .update({
          content: data.content,
          category: data.category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post updated successfully',
      });

      onPostUpdated?.();
      onClose();
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update post',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Edit Post
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <Textarea
              {...register('content')}
              disabled={isLoading}
              rows={5}
              maxLength={280}
              className="resize-none"
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
            {content && (
              <p className="text-xs text-gray-500 mt-1">
                {content.length}/280 characters
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              {...register('category')}
              disabled={isLoading}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F59E0B] dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="general">General</option>
              <option value="announcement">Announcement</option>
              <option value="question">Question</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
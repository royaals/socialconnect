'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { PostWithAuthor } from '@/types';
import { formatDate } from '@/lib/utils/format';
import { CommentSection } from './CommentSection';
import { EditPostModal } from './EditPostModal';

interface PostCardProps {
  post: PostWithAuthor;
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
}

export function PostCard({ post, onPostDeleted, onPostUpdated }: PostCardProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const currentUser = useAuthStore((state) => state.user);
  const [isLiked, setIsLiked] = useState(post.liked_by_user || false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      if (isLiked) {
        
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', currentUser.id);

        setIsLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        
        await supabase.from('likes').insert({
          post_id: post.id,
          user_id: currentUser.id,
        });

        setIsLiked(true);
        setLikeCount((prev) => prev + 1);

        if (post.author_id !== currentUser.id) {
          await supabase.from('notifications').insert({
            user_id: post.author_id,
            actor_id: currentUser.id,
            type: 'like',
            post_id: post.id,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like',
      });
    }
  };

  const handleDelete = async () => {
    if (!currentUser || !window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);

    try {

      if (post.image_url) {
        const imagePath = post.image_url.split('/').slice(-2).join('/');
        await supabase.storage.from('posts').remove([imagePath]);
      }

     
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });

      onPostDeleted?.();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete post',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwnPost = currentUser?.id === post.author_id;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      <article className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
       
        <div className="flex items-start justify-between mb-4">
          <Link
            href={`/profile/${post.author_id}`}
            className="flex items-center gap-3"
          >
            <Avatar className="w-12 h-12">
              <AvatarImage
                src={post.author.avatar_url || ''}
                alt={post.author.username}
              />
              <AvatarFallback className="bg-[#F59E0B] text-white">
                {post.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {post.author.first_name && post.author.last_name
                  ? `${post.author.first_name} ${post.author.last_name}`
                  : post.author.username}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(post.created_at)}
              </p>
            </div>
          </Link>

          {(isOwnPost || isAdmin) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                    {isOwnPost && (
                      <button
                        onClick={() => {
                          setIsEditModalOpen(true);
                          setShowMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Post
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      disabled={isDeleting}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Post
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      
        <div className="mb-4">
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

   
        {post.image_url && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <Image
              src={post.image_url}
              alt="Post image"
              width={800}
              height={600}
              className="w-full h-auto"
            />
          </div>
        )}

       
        <div className="flex items-center gap-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#F59E0B] transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isLiked ? 'fill-[#F59E0B] text-[#F59E0B]' : ''
              }`}
            />
            <span className="text-sm font-medium">{likeCount} Likes</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#F59E0B] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {post.comment_count} Comments
            </span>
          </button>
        </div>

   
        {showComments && (
          <CommentSection postId={post.id} onCommentAdded={onPostUpdated} />
        )}
      </article>

 
      <EditPostModal
        post={post}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onPostUpdated={onPostUpdated}
      />
    </>
  );
}
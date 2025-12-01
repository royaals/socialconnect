'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { CommentWithAuthor } from '@/types';
import { formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import { ChevronDown, Send, Loader2 } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentSection({ postId, onCommentAdded }: CommentSectionProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const currentUser = useAuthStore((state) => state.user);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingComments, setIsFetchingComments] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsFetchingComments(true);
      
      const { data, error } = await supabase
        .from('comments')
        .select(
          `
          *,
          author:profiles(*)
        `
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch comments error:', error);
        throw error;
      }

      setComments(data as unknown as CommentWithAuthor[]);
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load comments',
      });
    } finally {
      setIsFetchingComments(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newComment.trim()) return;

    setIsLoading(true);

    try {
      
      const { data: commentData, error: commentError } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: currentUser.id,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (commentError) {
        console.error('Comment insert error:', commentError);
        throw commentError;
      }

      
      const { data: commentWithAuthor, error: fetchError } = await supabase
        .from('comments')
        .select(
          `
          *,
          author:profiles(*)
        `
        )
        .eq('id', commentData.id)
        .single();

      if (fetchError) {
        console.error('Fetch comment error:', fetchError);
        throw fetchError;
      }

      setComments([commentWithAuthor as unknown as CommentWithAuthor, ...comments]);
      setNewComment('');
      onCommentAdded?.();

      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });

    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add comment',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displayedComments = showAll ? comments : comments.slice(0, 2);
  const hasMoreComments = comments.length > 2;

  if (isFetchingComments) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
     
      {hasMoreComments && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#F59E0B] transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
          Show more comments ({comments.length - 2} more)
        </button>
      )}

      <div className="space-y-4">
        {displayedComments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Link href={`/profile/${comment.author_id}`}>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage
                  src={comment.author.avatar_url || ''}
                  alt={comment.author.username}
                />
                <AvatarFallback className="bg-[#F59E0B] text-white text-xs">
                  {comment.author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <Link
                  href={`/profile/${comment.author_id}`}
                  className="font-semibold text-sm text-gray-900 dark:text-white hover:underline"
                >
                  {comment.author.first_name && comment.author.last_name
                    ? `${comment.author.first_name} ${comment.author.last_name}`
                    : comment.author.username}
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
            </div>
          </div>
        ))}
      </div>

  
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage
            src={currentUser?.avatar_url || ''}
            alt={currentUser?.username}
          />
          <AvatarFallback className="bg-[#F59E0B] text-white text-xs">
            {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 flex gap-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            disabled={isLoading}
            maxLength={280}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !newComment.trim()}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
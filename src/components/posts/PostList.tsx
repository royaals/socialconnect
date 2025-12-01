'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { PostWithAuthor } from '@/types';
import { PostCard } from './PostCard';
import { Loader2 } from 'lucide-react';

interface PostListProps {
  userId?: string;
  refresh?: number;
}

export function PostList({ userId, refresh }: PostListProps) {
  const supabase = createClient();
  const currentUser = useAuthStore((state) => state.user);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [userId, refresh]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from('posts')
        .select(
          `
          *,
          author:profiles(*)
        `
        )
        .eq('is_active', true)
        .order('created_at', { ascending: false });

  
      if (userId) {
        query = query.eq('author_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

    
      if (currentUser) {
        const postsWithLikes = await Promise.all(
          (data || []).map(async (post) => {
            const { data: like } = await supabase
              .from('likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', currentUser.id)
              .single();

            return {
              ...post,
              liked_by_user: !!like,
            } as PostWithAuthor;
          })
        );

        setPosts(postsWithLikes);
      } else {
        setPosts((data as unknown as PostWithAuthor[]) || []);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onPostDeleted={fetchPosts}
          onPostUpdated={fetchPosts}
        />
      ))}
    </div>
  );
}
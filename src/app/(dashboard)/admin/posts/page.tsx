'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/use-toast';
import { PostWithAuthor } from '@/types';
import { PostCard } from '@/components/posts/PostCard';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AdminPostsPage() {
  const router = useRouter();
  const supabase = createClient();
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'admin') {
      router.push('/home');
      return;
    }

    await fetchPosts();
  };

  const fetchPosts = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          *,
          author:profiles(*)
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data as unknown as PostWithAuthor[]);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch posts',
      });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Post Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Total: {posts.length} posts
          </p>
        </div>
      </div>

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
    </div>
  );
}
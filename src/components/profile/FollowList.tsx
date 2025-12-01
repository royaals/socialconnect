'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Profile } from '@/types';
import { Loader2 } from 'lucide-react';

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
}

export function FollowList({ userId, type }: FollowListProps) {
  const supabase = createClient();
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [userId, type]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      if (type === 'followers') {
        const { data, error } = await supabase
          .from('follows')
          .select('follower:profiles!follower_id(*)')
          .eq('following_id', userId);

        if (error) throw error;
        setUsers(data?.map((d: any) => d.follower) || []);
      } else {
        const { data, error } = await supabase
          .from('follows')
          .select('following:profiles!following_id(*)')
          .eq('follower_id', userId);

        if (error) throw error;
        setUsers(data?.map((d: any) => d.following) || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    if (!currentUser) return;

    try {
      await supabase.from('follows').insert({
        follower_id: currentUser.id,
        following_id: targetUserId,
      });

      // Refresh list
      fetchUsers();
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No {type === 'followers' ? 'followers' : 'following'} yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar_url || ''} alt={user.username} />
              <AvatarFallback className="bg-[#F59E0B] text-white">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                @{user.username}
              </p>
            </div>
          </Link>
          {currentUser?.id !== user.id && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleFollow(user.id)}
            >
              Follow
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
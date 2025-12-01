'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { ProfileWithStats } from '@/types';
import { useAuthStore } from '@/stores/authStore';

interface Trend {
  tag: string;
  posts: number;
}

export function RightSidebar() {
  const supabase = createClient();
  const currentUser = useAuthStore((state) => state.user);
  const [suggestions, setSuggestions] = useState<ProfileWithStats[]>([]);


  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    if (!currentUser) return;

    // Get users the current user is not following
    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id);

    const followingIds = following?.map((f) => f.following_id) || [];

    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUser.id)
      .not('id', 'in', `(${followingIds.join(',')})`)
      .limit(3);

    if (users) {
      setSuggestions(users as ProfileWithStats[]);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;

    try {
      await supabase.from('follows').insert({
        follower_id: currentUser.id,
        following_id: userId,
      });

     
      setSuggestions((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <aside className="hidden xl:flex xl:flex-col xl:w-80 xl:fixed xl:right-0 xl:top-16 xl:bottom-0 p-6 space-y-6 overflow-y-auto">
     
    
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Follow Suggestions
        </h2>
        <div className="space-y-4">
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-3 flex-1"
              >
                <Avatar className="w-10 h-10">
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleFollow(user.id)}
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
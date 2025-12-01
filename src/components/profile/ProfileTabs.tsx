'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { PostList } from '@/components/posts/PostList';
import { FollowList } from './FollowList';

interface ProfileTabsProps {
  userId: string;
}

export function ProfileTabs({ userId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'followers' | 'following'>(
    'profile'
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex-1 px-6 py-4 text-sm font-medium transition-colors',
            activeTab === 'profile'
              ? 'text-[#F59E0B] border-b-2 border-[#F59E0B]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={cn(
            'flex-1 px-6 py-4 text-sm font-medium transition-colors',
            activeTab === 'followers'
              ? 'text-[#F59E0B] border-b-2 border-[#F59E0B]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          Followers
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={cn(
            'flex-1 px-6 py-4 text-sm font-medium transition-colors',
            activeTab === 'following'
              ? 'text-[#F59E0B] border-b-2 border-[#F59E0B]'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          Followings
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <PostList userId={userId} />
          </div>
        )}
        {activeTab === 'followers' && <FollowList userId={userId} type="followers" />}
        {activeTab === 'following' && <FollowList userId={userId} type="following" />}
      </div>
    </div>
  );
}
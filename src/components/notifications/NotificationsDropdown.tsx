'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationText = (notification: any) => {
    switch (notification.type) {
      case 'follow':
        return 'started following you';
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'mention':
        return 'mentioned you in a post';
      default:
        return 'interacted with you';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[600px] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <Link
                    key={notification.id}
                    href={
                      notification.post_id
                        ? `/home`
                        : `/profile/${notification.actor_id}`
                    }
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors',
                      !notification.is_read && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage
                        src={notification.actor?.avatar_url || ''}
                        alt={notification.actor?.username}
                      />
                      <AvatarFallback className="bg-[#F59E0B] text-white">
                        {notification.actor?.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">
                          {notification.actor?.username}
                        </span>{' '}
                        {getNotificationText(notification)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
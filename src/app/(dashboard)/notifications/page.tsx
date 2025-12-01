'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Loader2, Heart, MessageCircle, UserPlus, CheckCheck, RefreshCw } from 'lucide-react';

interface NotificationWithActor {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'mention';
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  actor: {
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function NotificationsPage() {
  const supabase = createClient();
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<NotificationWithActor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchNotifications = async (showRefreshToast = false) => {
    if (!user) return;

    try {
      if (showRefreshToast) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const { data, error } = await supabase
        .from('notifications')
        .select(
          `
          *,
          actor:profiles!actor_id(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Fetch notifications error:', error);
        throw error;
      }

      console.log('Fetched notifications:', data);
      setNotifications(data as unknown as NotificationWithActor[]);

      if (showRefreshToast) {
        toast({
          title: 'Refreshed',
          description: 'Notifications updated',
        });
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load notifications',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    console.log('Subscribing to notifications for user:', user.id);

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          console.log('New notification received:', payload);

          
          const { data } = await supabase
            .from('notifications')
            .select(
              `
              *,
              actor:profiles!actor_id(
                id,
                username,
                first_name,
                last_name,
                avatar_url
              )
            `
            )
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setNotifications((prev) => [data as unknown as NotificationWithActor, ...prev]);
            
         
            toast({
              title: 'New Notification',
              description: 'You have a new notification',
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from notifications');
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
      });
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notifications as read',
      });
    }
  };

  const getNotificationText = (notification: NotificationWithActor) => {
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Heart className="w-5 h-5 text-gray-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#F59E0B]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchNotifications(true)}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
          </Button>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#FEF3C7] dark:bg-[#451A03] rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-[#F59E0B]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              No notifications yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              When someone follows you, likes your posts, or comments, you'll see it here.
            </p>
          </div>
        </div>
      ) : (
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => (
            <Link
              key={notification.id}
              href={
                notification.post_id
                  ? `/home`
                  : `/profile/${notification.actor?.id}`
              }
              onClick={() => {
                if (!notification.is_read) {
                  markAsRead(notification.id);
                }
              }}
              className={cn(
                'flex gap-4 p-6 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors',
                !notification.is_read && 'bg-blue-50 dark:bg-blue-900/20'
              )}
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={notification.actor?.avatar_url || ''}
                    alt={notification.actor?.username || 'User'}
                  />
                  <AvatarFallback className="bg-[#F59E0B] text-white">
                    {notification.actor?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1">
                  {getNotificationIcon(notification.type)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-semibold">
                    {notification.actor?.first_name && notification.actor?.last_name
                      ? `${notification.actor.first_name} ${notification.actor.last_name}`
                      : notification.actor?.username || 'Someone'}
                  </span>{' '}
                  {getNotificationText(notification)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {formatDate(notification.created_at)}
                </p>
              </div>

              {!notification.is_read && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
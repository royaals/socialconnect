'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Bell, LogOut, Shield } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const user = useAuthStore((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    setUnreadCount(count || 0);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-count')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const navigation = [
    { name: 'Home', href: '/home', icon: Home, adminOnly: false },
    { name: 'My Profile', href: '/profile', icon: User, adminOnly: false },
    { 
      name: 'Notifications', 
      href: '/notifications', 
      icon: Bell, 
      adminOnly: false,
      badge: unreadCount > 0 ? unreadCount : null 
    },
    { name: 'Admin', href: '/admin', icon: Shield, adminOnly: true },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out',
      });
    }
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => {
           
            if (item.adminOnly && user?.role !== 'admin') return null;

            const isActive =
              item.href === '/profile'
                ? pathname.startsWith('/profile')
                : item.href === '/admin'
                ? pathname.startsWith('/admin')
                : pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href === '/profile' ? `/profile/${user?.id}` : item.href}
                className={cn(
                  'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-[#FEF3C7] text-gray-900 dark:bg-[#92400E] dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
                {item.badge && (
                  <span className="bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </nav>
      </div>
    </aside>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/authStore';
import { Users, FileText, Activity, TrendingUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalPosts: number;
  activeToday: number;
  totalLikes: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<Stats | null>(null);
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

    await fetchStats();
  };

  const fetchStats = async () => {
    try {
      setIsLoading(true);

     
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

     
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      
      const { count: totalLikes } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true });

     
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: activeToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login', yesterday.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        totalPosts: totalPosts || 0,
        activeToday: activeToday || 0,
        totalLikes: totalLikes || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage users, posts, and view analytics
        </p>
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Posts"
          value={stats?.totalPosts || 0}
          icon={FileText}
          color="bg-green-500"
        />
        <StatCard
          title="Active Today"
          value={stats?.activeToday || 0}
          icon={Activity}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Likes"
          value={stats?.totalLikes || 0}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="User Management"
          description="View and manage all users"
          href="/admin/users"
          icon={Users}
        />
        <QuickActionCard
          title="Post Management"
          description="View and moderate posts"
          href="/admin/posts"
          icon={FileText}
        />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: any;
}) {
  return (
    <a
      href={href}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-[#F59E0B] transition-colors group"
    >
      <div className="flex items-start gap-4">
        <div className="bg-[#FEF3C7] dark:bg-[#451A03] w-12 h-12 rounded-lg flex items-center justify-center group-hover:bg-[#F59E0B] transition-colors">
          <Icon className="w-6 h-6 text-[#F59E0B] group-hover:text-white transition-colors" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        </div>
      </div>
    </a>
  );
}
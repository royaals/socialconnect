'use client';

import Link from 'next/link';
import { Settings, Menu, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';
import { MobileSidebar } from './MobileSidebar';

export function Header() {
  const { theme, toggleTheme } = useThemeStore();
  const user = useAuthStore((state) => state.user);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Link href="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="hidden sm:inline text-xl font-bold text-[#F59E0B]">
                Socialhop
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
  
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

           
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              >
                <Settings className="w-5 h-5" />
              </Button>

              {showSettingsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSettingsMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <Link
                      href="/settings/password"
                      onClick={() => setShowSettingsMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Change Password
                    </Link>
                  
                  </div>
                </>
              )}
            </div>

            <Link href={`/profile/${user?.id}`}>
              <Avatar className="w-9 h-9 border-2 border-[#F59E0B]">
                <AvatarImage src={user?.avatar_url || ''} alt={user?.username} />
                <AvatarFallback className="bg-[#F59E0B] text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </header>

      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
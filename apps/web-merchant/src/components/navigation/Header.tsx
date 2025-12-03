'use client';

/**
 * Header Component v2.0
 * "Precision OS" Navigation
 *
 * Features:
 * - Clean, minimal design (56px height)
 * - Global search trigger
 * - Notifications center
 * - Network status indicator
 * - User menu with theme toggle
 * - Quick actions trigger
 */

import * as React from 'react';
import {
  Search,
  Bell,
  User,
  Command,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button-v2';
import { Badge } from '@/components/ui/badge-v2';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTheme } from '@/components/theme-provider';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface HeaderProps {
  onCommandBarOpen?: () => void;
  onQuickActionsOpen?: () => void;
}

export function Header({ onCommandBarOpen, onQuickActionsOpen }: HeaderProps) {
  const { theme } = useTheme();
  const { status: networkStatus } = useNetworkStatus();
  const [notificationCount, setNotificationCount] = React.useState(3);

  const networkStatusConfig = {
    online: {
      icon: Wifi,
      label: 'Online',
      color: 'text-success-600',
      bgColor: 'bg-success-500/12',
    },
    offline: {
      icon: WifiOff,
      label: 'Offline',
      color: 'text-danger-600',
      bgColor: 'bg-danger-500/12',
    },
  };

  const status = networkStatusConfig[networkStatus];
  const StatusIcon = status.icon;

  return (
    <header
      className={cn(
        'h-14 flex items-center justify-between px-6',
        'bg-white dark:bg-[#161618]',
        'border-b border-border-DEFAULT dark:border-[#2A2A2D]'
      )}
    >
      {/* Left: Search Trigger */}
      <button
        onClick={onCommandBarOpen}
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg',
          'bg-background-darker dark:bg-[#0A0A0B]',
          'border border-border-DEFAULT dark:border-[#2A2A2D]',
          'hover:border-border-hover dark:hover:border-[#3A3A3C]',
          'transition-colors duration-150',
          'w-full max-w-md'
        )}
      >
        <Search className="h-4 w-4 text-foreground-tertiary dark:text-[#636366]" />
        <span className="text-sm text-foreground-tertiary dark:text-[#636366]">
          Search or type a command...
        </span>
        <div className="ml-auto flex items-center gap-1">
          <kbd className="hidden sm:flex items-center px-1.5 py-0.5 rounded bg-white dark:bg-[#161618] border border-border-DEFAULT dark:border-[#2A2A2D] text-xs text-foreground-secondary dark:text-[#A1A1A6] font-mono">
            <Command className="h-3 w-3 mr-0.5" />K
          </kbd>
        </div>
      </button>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Actions Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onQuickActionsOpen}
          className="hidden md:flex"
          iconBefore={<Plus className="h-4 w-4" />}
        >
          Quick Actions
        </Button>

        {/* Network Status */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg',
            status.bgColor,
            'border border-transparent'
          )}
        >
          <StatusIcon
            className={cn(
              'h-4 w-4',
              status.color
            )}
          />
          <span className={cn('text-xs font-medium hidden sm:block', status.color)}>
            {status.label}
          </span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                'relative p-2 rounded-lg',
                'text-foreground-secondary dark:text-[#A1A1A6]',
                'hover:bg-background-subtle dark:hover:bg-[#1A1A1D]',
                'transition-colors duration-150'
              )}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger-500" />
              )}
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={cn(
                'min-w-[320px] p-2 rounded-lg',
                'bg-white dark:bg-[#161618]',
                'border border-[#E5E7EB] dark:border-[#2A2A2D]',
                'shadow-lg',
                'animate-slide-down'
              )}
              sideOffset={8}
              align="end"
            >
              <div className="px-3 py-2 border-b border-[#F3F4F6] dark:border-[#1A1A1D]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#111827] dark:text-[#FAFAFA]">
                    Notifications
                  </h3>
                  <Badge variant="primary" size="sm">
                    {notificationCount}
                  </Badge>
                </div>
              </div>

              <div className="py-2">
                <div className="px-3 py-2 hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D] rounded-md cursor-pointer">
                  <p className="text-sm text-[#111827] dark:text-[#FAFAFA] font-medium">
                    New order received
                  </p>
                  <p className="text-xs text-[#9CA3AF] dark:text-[#636366] mt-1">
                    Order #1234 - $45.00
                  </p>
                  <p className="text-xs text-[#9CA3AF] dark:text-[#636366] mt-1">2 min ago</p>
                </div>
                <div className="px-3 py-2 hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D] rounded-md cursor-pointer">
                  <p className="text-sm text-[#111827] dark:text-[#FAFAFA] font-medium">
                    Equipment maintenance due
                  </p>
                  <p className="text-xs text-[#9CA3AF] dark:text-[#636366] mt-1">
                    Washer #2 - Tomorrow
                  </p>
                  <p className="text-xs text-[#9CA3AF] dark:text-[#636366] mt-1">1 hour ago</p>
                </div>
              </div>

              <div className="px-3 py-2 border-t border-[#F3F4F6] dark:border-[#1A1A1D]">
                <button className="text-xs text-[#0066FF] hover:text-[#0052CC] font-medium">
                  View all notifications
                </button>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* User Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-lg',
                'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                'transition-colors duration-150'
              )}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#0066FF] to-[#00A86B] flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <ChevronDown className="h-4 w-4 text-[#9CA3AF] dark:text-[#636366] hidden sm:block" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={cn(
                'min-w-[240px] p-2 rounded-lg',
                'bg-white dark:bg-[#161618]',
                'border border-[#E5E7EB] dark:border-[#2A2A2D]',
                'shadow-lg',
                'animate-slide-down'
              )}
              sideOffset={8}
              align="end"
            >
              {/* User Info */}
              <div className="px-3 py-2 border-b border-[#F3F4F6] dark:border-[#1A1A1D]">
                <p className="text-sm font-medium text-[#111827] dark:text-[#FAFAFA]">
                  Sarah Johnson
                </p>
                <p className="text-xs text-[#9CA3AF] dark:text-[#636366] mt-0.5">
                  sarah@example.com
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <DropdownMenu.Item asChild>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                      'text-sm text-[#374151] dark:text-[#FAFAFA]',
                      'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                      'cursor-pointer outline-none'
                    )}
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                      'text-sm text-[#374151] dark:text-[#FAFAFA]',
                      'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                      'cursor-pointer outline-none'
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                      'text-sm text-[#374151] dark:text-[#FAFAFA]',
                      'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                      'cursor-pointer outline-none'
                    )}
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Help & Support</span>
                  </button>
                </DropdownMenu.Item>
              </div>

              {/* Logout */}
              <div className="pt-2 border-t border-[#F3F4F6] dark:border-[#1A1A1D]">
                <DropdownMenu.Item asChild>
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                      'text-sm text-[#FF3B30]',
                      'hover:bg-[#FF3B30]/5',
                      'cursor-pointer outline-none'
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </DropdownMenu.Item>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}

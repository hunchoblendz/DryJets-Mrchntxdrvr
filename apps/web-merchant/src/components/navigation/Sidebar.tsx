'use client';

/**
 * Sidebar Component v3.0
 * "Dummy User Friendly" Navigation
 *
 * Features:
 * - Simplified navigation for new users
 * - 5 primary items always visible
 * - Secondary items collapsed by default (progressive disclosure)
 * - Clean, minimal design (light/dark mode)
 * - 240px expanded, 64px collapsed
 * - Smooth animations
 */

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  ShoppingCart,
  Wrench,
  Truck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronDown,
  Users,
  Package,
  Calendar,
  FileText,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge-v2';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  shortcut?: string;
  section?: 'main' | 'secondary' | 'bottom';
}

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const navigationItems: NavItem[] = [
  // Main navigation - Always visible (5 primary items for "dummy users")
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    shortcut: '⌘D',
    section: 'main',
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    badge: 12,
    shortcut: '⌘O',
    section: 'main',
  },
  {
    label: 'Equipment',
    href: '/equipment',
    icon: Wrench,
    badge: 2,
    shortcut: '⌘E',
    section: 'main',
  },
  {
    label: 'Drivers',
    href: '/drivers',
    icon: Truck,
    shortcut: '⌘R',
    section: 'main',
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    section: 'main',
  },

  // Secondary navigation - Collapsed by default (power user features)
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
    section: 'secondary',
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Package,
    section: 'secondary',
  },
  {
    label: 'Schedule',
    href: '/schedule',
    icon: Calendar,
    section: 'secondary',
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
    section: 'secondary',
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: CreditCard,
    section: 'secondary',
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    section: 'secondary',
  },

  // Bottom navigation
  {
    label: 'Help & Support',
    href: '/help',
    icon: HelpCircle,
    section: 'bottom',
  },
];

export function Sidebar({ collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [localCollapsed, setLocalCollapsed] = React.useState(false);
  const [showSecondary, setShowSecondary] = React.useState(false); // Hidden by default for "dummy users"

  const collapsed = controlledCollapsed ?? localCollapsed;
  const setCollapsed = onCollapsedChange ?? setLocalCollapsed;

  // Group navigation items
  const mainItems = navigationItems.filter((item) => item.section === 'main');
  const secondaryItems = navigationItems.filter((item) => item.section === 'secondary');
  const bottomItems = navigationItems.filter((item) => item.section === 'bottom');

  // Check if route is active
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen',
        'bg-white dark:bg-[#0A0A0B]',
        'border-r border-border-DEFAULT dark:border-[#2A2A2D]',
        'transition-all duration-300 ease-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-border-subtle dark:border-[#1A1A1D] flex-shrink-0">
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-base">DJ</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center">
              <span className="text-white font-bold text-base">DJ</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground-DEFAULT dark:text-[#FAFAFA]">
                DryJets
              </h1>
              <p className="text-xs text-foreground-secondary dark:text-[#A1A1A6]">Daily Ops</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg',
                    'transition-all duration-150',
                    'cursor-pointer',
                    active
                      ? 'bg-primary-500/8 text-primary-600 dark:bg-primary-500/10'
                      : 'text-foreground-secondary dark:text-[#A1A1A6] hover:bg-background-subtle dark:hover:bg-[#1A1A1D] hover:text-foreground-DEFAULT dark:hover:text-[#FAFAFA]'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-500 rounded-full" />
                  )}

                  <Icon className={cn('h-5 w-5 flex-shrink-0', collapsed && 'mx-auto')} />

                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="primary" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                      {item.shortcut && !item.badge && (
                        <kbd className="hidden group-hover:flex items-center px-1.5 py-0.5 rounded bg-background-subtle dark:bg-[#1A1A1D] text-xs text-foreground-tertiary dark:text-[#636366] font-mono">
                          {item.shortcut}
                        </kbd>
                      )}
                    </>
                  )}

                  {collapsed && item.badge && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold leading-none">
                        {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation - Collapsible for "Dummy Users" */}
        {!collapsed && (
          <>
            <button
              type="button"
              onClick={() => setShowSecondary(!showSecondary)}
              className="mt-6 mb-2 px-3 w-full flex items-center justify-between group"
            >
              <span className="text-xs font-medium text-foreground-tertiary dark:text-[#636366] uppercase tracking-wider">
                More Features
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-foreground-tertiary dark:text-[#636366] transition-transform duration-200',
                  showSecondary && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence>
              {showSecondary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    {secondaryItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={cn(
                              'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg',
                              'transition-all duration-150',
                              'cursor-pointer',
                              active
                                ? 'bg-primary-500/8 text-primary-600 dark:bg-primary-500/10'
                                : 'text-foreground-secondary dark:text-[#A1A1A6] hover:bg-background-subtle dark:hover:bg-[#1A1A1D] hover:text-foreground-DEFAULT dark:hover:text-[#FAFAFA]'
                            )}
                          >
                            {active && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-500 rounded-full" />
                            )}
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            <span className="flex-1 text-sm font-medium">{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border-subtle dark:border-[#1A1A1D] py-2 px-2">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                  'transition-all duration-150',
                  'cursor-pointer',
                  active
                    ? 'bg-primary-500/8 text-primary-600 dark:bg-primary-500/10'
                    : 'text-foreground-secondary dark:text-[#A1A1A6] hover:bg-background-subtle dark:hover:bg-[#1A1A1D] hover:text-foreground-DEFAULT dark:hover:text-[#FAFAFA]'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn('h-5 w-5 flex-shrink-0', collapsed && 'mx-auto')} />
                {!collapsed && <span className="flex-1 text-sm font-medium">{item.label}</span>}
              </div>
            </Link>
          );
        })}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mt-1',
            'text-foreground-secondary dark:text-[#A1A1A6]',
            'hover:bg-background-subtle dark:hover:bg-[#1A1A1D]',
            'transition-all duration-150'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform duration-200',
              collapsed ? 'rotate-180 mx-auto' : ''
            )}
          />
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

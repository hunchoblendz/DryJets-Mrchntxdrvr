'use client';

/**
 * ControlCenterLayout - Enterprise control center with persistent sidebar
 *
 * Features:
 * - Persistent sidebar navigation with collapsible state
 * - Network status indicator (online/offline only)
 * - Dark theme with neon accents
 * - Keyboard shortcuts (Cmd+K for search, Cmd+B for toggle sidebar)
 */

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  Wrench,
  Truck,
  BarChart3,
  Settings,
  Menu,
  X,
  Wifi,
  WifiOff,
  ChevronLeft,
  Search,
  Bell,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

/**
 * Navigation items
 */
const navigationItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    badge: null,
  },
  {
    label: 'Equipment',
    href: '/dashboard/equipment',
    icon: Wrench,
    badge: null,
  },
  {
    label: 'Drivers',
    href: '/dashboard/drivers',
    icon: Truck,
    badge: null,
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    badge: null,
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    badge: null,
  },
];

interface ControlCenterLayoutProps {
  children: ReactNode;
}

export function ControlCenterLayout({ children }: ControlCenterLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simple network status (cloud-only)
  const { status: networkStatus, isOnline } = useNetworkStatus();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+B or Ctrl+B - Toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      }

      // Cmd+K or Ctrl+K - Search (placeholder)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        console.log('Search shortcut triggered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen flex bg-background-DEFAULT overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r border-border-DEFAULT transition-all duration-300 bg-background-darker',
          sidebarCollapsed ? 'w-20' : 'w-280'
        )}
        style={{ width: sidebarCollapsed ? '80px' : '280px' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-DEFAULT">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center shadow-glow-primary">
                <span className="text-white font-bold text-xl">DJ</span>
              </div>
              <div>
                <h1 className="text-foreground-DEFAULT font-bold text-lg">DryJetsOS</h1>
                <p className="text-foreground-tertiary text-xs">Control Center</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center shadow-glow-primary mx-auto">
              <span className="text-white font-bold text-xl">DJ</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all group',
                    isActive
                      ? 'bg-primary-500/10 text-primary-500 shadow-glow-primary'
                      : 'text-foreground-secondary hover:bg-background-subtle hover:text-foreground-DEFAULT'
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'animate-pulse-slow')} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar toggle */}
        <div className="p-3 border-t border-border-DEFAULT">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full justify-start"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                sidebarCollapsed && 'rotate-180'
              )}
            />
            {!sidebarCollapsed && <span className="ml-2 text-sm">Collapse</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border-DEFAULT bg-background-lighter flex items-center justify-between px-6">
          {/* Left: Mobile menu + Search */}
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Search (placeholder) */}
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-background-subtle border border-border-subtle text-foreground-tertiary hover:border-border-hover transition-colors">
              <Search className="h-4 w-4" />
              <span className="text-sm">Search...</span>
              <kbd className="ml-4 px-1.5 py-0.5 rounded bg-background-darker text-xs">Cmd+K</kbd>
            </button>
          </div>

          {/* Right: Network status + Notifications + User */}
          <div className="flex items-center gap-4">
            {/* Network Status Widget */}
            <div
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg border transition-all',
                isOnline
                  ? 'bg-success-500/10 border-success-500/30'
                  : 'bg-danger-500/10 border-danger-500/30'
              )}
            >
              {/* Status icon */}
              <div className="relative">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-success-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-danger-500" />
                )}
              </div>

              {/* Status text */}
              <div className="hidden md:block">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isOnline ? 'text-success-500' : 'text-danger-500'
                  )}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-xs text-foreground-tertiary">
                  {isOnline ? 'Connected to cloud' : 'No connection'}
                </p>
              </div>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-danger-500"></span>
            </Button>

            {/* User menu */}
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium">Admin</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background-DEFAULT">
          {/* Alert banner for offline mode */}
          {!isOnline && (
            <div className="bg-warning-500/10 border-b border-warning-500/30 px-6 py-3 flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-warning-500" />
              <div>
                <p className="text-sm font-semibold text-warning-500">You are Offline</p>
                <p className="text-xs text-foreground-tertiary">
                  Please check your internet connection. Changes cannot be saved while offline.
                </p>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Menu */}
          <aside className="absolute left-0 top-0 bottom-0 w-280 bg-background-darker border-r border-border-DEFAULT">
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border-DEFAULT">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-success-500 flex items-center justify-center shadow-glow-primary">
                  <span className="text-white font-bold text-xl">DJ</span>
                </div>
                <div>
                  <h1 className="text-foreground-DEFAULT font-bold text-lg">DryJetsOS</h1>
                  <p className="text-foreground-tertiary text-xs">Control Center</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="px-3 py-6 space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                        isActive
                          ? 'bg-primary-500/10 text-primary-500 shadow-glow-primary'
                          : 'text-foreground-secondary hover:bg-background-subtle hover:text-foreground-DEFAULT'
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

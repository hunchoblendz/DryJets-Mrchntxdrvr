'use client';

/**
 * ThemeToggle Component
 * Animated Sun/Moon icon toggle with dropdown for theme selection
 *
 * Features:
 * - Smooth transitions with Framer Motion
 * - Dropdown with Light/Dark/System + Theme options
 * - Accessible with keyboard navigation
 * - Persists theme choice via theme-provider
 */

import * as React from 'react';
import { Moon, Sun, Monitor, Check, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTheme, themes } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, colorMode, resolvedColorMode, setTheme, setColorMode } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className={cn(
          'p-2 rounded-lg',
          'text-foreground-secondary dark:text-[#A1A1A6]',
          'hover:bg-background-subtle dark:hover:bg-[#1A1A1D]',
          'transition-colors duration-150'
        )}
        aria-label="Toggle theme"
      >
        <Palette className="h-5 w-5" />
      </button>
    );
  }

  const currentIcon = resolvedColorMode === 'dark' ? Moon : Sun;
  const currentTheme = themes.find((t) => t.name === theme);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'relative flex items-center gap-2 px-3 py-2 rounded-lg',
            'text-foreground-secondary dark:text-[#A1A1A6]',
            'hover:bg-background-subtle dark:hover:bg-[#1A1A1D]',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
          )}
          aria-label="Toggle theme"
        >
          {/* Theme color dots */}
          <div className="flex gap-1">
            <div
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: currentTheme?.colors.primary }}
            />
            <div
              className="w-3 h-3 rounded-full border border-border"
              style={{ backgroundColor: currentTheme?.colors.accent }}
            />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={resolvedColorMode}
              initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            >
              {React.createElement(currentIcon, { className: 'h-4 w-4' })}
            </motion.div>
          </AnimatePresence>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'min-w-[240px] p-1 rounded-lg',
            'bg-white dark:bg-[#161618]',
            'border border-[#E5E7EB] dark:border-[#2A2A2D]',
            'shadow-lg',
            'animate-slide-down',
            'z-50'
          )}
          sideOffset={8}
          align="end"
        >
          {/* Theme Selection */}
          <DropdownMenu.Label className="px-3 py-1.5 text-xs font-medium text-[#9CA3AF] dark:text-[#636366]">
            Color Theme
          </DropdownMenu.Label>
          {themes.map((t) => (
            <DropdownMenu.Item key={t.name} asChild>
              <button
                onClick={() => setTheme(t.name)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                  'text-sm text-[#374151] dark:text-[#FAFAFA]',
                  'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                  'cursor-pointer outline-none',
                  'transition-colors duration-150'
                )}
              >
                <div className="flex gap-1">
                  <div
                    className="w-3 h-3 rounded-full border border-[#E5E7EB] dark:border-[#3A3A3C]"
                    style={{ backgroundColor: t.colors.primary }}
                  />
                  <div
                    className="w-3 h-3 rounded-full border border-[#E5E7EB] dark:border-[#3A3A3C]"
                    style={{ backgroundColor: t.colors.accent }}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-[#9CA3AF] dark:text-[#636366]">{t.description}</div>
                </div>
                {theme === t.name && (
                  <Check className="h-4 w-4 text-primary-600" />
                )}
              </button>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="my-1 h-px bg-[#E5E7EB] dark:bg-[#2A2A2D]" />

          {/* Appearance Selection */}
          <DropdownMenu.Label className="px-3 py-1.5 text-xs font-medium text-[#9CA3AF] dark:text-[#636366]">
            Appearance
          </DropdownMenu.Label>
          <DropdownMenu.Item asChild>
            <button
              onClick={() => setColorMode('light')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                'text-sm text-[#374151] dark:text-[#FAFAFA]',
                'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                'cursor-pointer outline-none',
                'transition-colors duration-150'
              )}
            >
              <Sun className="h-4 w-4" />
              <span className="flex-1 text-left">Light</span>
              {colorMode === 'light' && <Check className="h-4 w-4 text-primary-600" />}
            </button>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <button
              onClick={() => setColorMode('dark')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                'text-sm text-[#374151] dark:text-[#FAFAFA]',
                'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                'cursor-pointer outline-none',
                'transition-colors duration-150'
              )}
            >
              <Moon className="h-4 w-4" />
              <span className="flex-1 text-left">Dark</span>
              {colorMode === 'dark' && <Check className="h-4 w-4 text-primary-600" />}
            </button>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <button
              onClick={() => setColorMode('system')}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md',
                'text-sm text-[#374151] dark:text-[#FAFAFA]',
                'hover:bg-[#F3F4F6] dark:hover:bg-[#1A1A1D]',
                'cursor-pointer outline-none',
                'transition-colors duration-150'
              )}
            >
              <Monitor className="h-4 w-4" />
              <span className="flex-1 text-left">System</span>
              {colorMode === 'system' && <Check className="h-4 w-4 text-primary-600" />}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

'use client';

import * as React from 'react';
import { Check, Moon, Palette, Sun, Monitor } from 'lucide-react';
import { useTheme, themes } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
  const { theme, colorMode, setTheme, setColorMode } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Color Theme
        </DropdownMenuLabel>
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.name}
            onClick={() => setTheme(t.name)}
            className="flex items-center gap-3 cursor-pointer"
          >
            {/* Theme color preview */}
            <div className="flex gap-1">
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: t.colors.primary }}
              />
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: t.colors.accent }}
              />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.description}</div>
            </div>
            {theme === t.name && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Appearance
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => setColorMode('light')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span className="flex-1">Light</span>
          {colorMode === 'light' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setColorMode('dark')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span className="flex-1">Dark</span>
          {colorMode === 'dark' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setColorMode('system')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Monitor className="h-4 w-4" />
          <span className="flex-1">System</span>
          {colorMode === 'system' && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for sidebars
export function ThemeSwitcherCompact() {
  const { theme, colorMode, resolvedColorMode, setTheme, setColorMode } = useTheme();
  const [open, setOpen] = React.useState(false);

  const currentTheme = themes.find((t) => t.name === theme);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg w-full',
            'text-sm text-foreground-secondary hover:bg-background-subtle',
            'transition-colors duration-150'
          )}
        >
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
          <span className="flex-1 text-left">{currentTheme?.label}</span>
          {resolvedColorMode === 'dark' ? (
            <Moon className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Sun className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.name}
            onClick={() => setTheme(t.name)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="flex gap-1">
              <div
                className="w-3 h-3 rounded-full border border-border"
                style={{ backgroundColor: t.colors.primary }}
              />
              <div
                className="w-3 h-3 rounded-full border border-border"
                style={{ backgroundColor: t.colors.accent }}
              />
            </div>
            <span className="flex-1 text-sm">{t.label}</span>
            {theme === t.name && <Check className="h-3.5 w-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Mode
        </DropdownMenuLabel>
        <div className="flex gap-1 p-1">
          <button
            onClick={() => setColorMode('light')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs',
              colorMode === 'light'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <Sun className="h-3 w-3" />
            Light
          </button>
          <button
            onClick={() => setColorMode('dark')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs',
              colorMode === 'dark'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <Moon className="h-3 w-3" />
            Dark
          </button>
          <button
            onClick={() => setColorMode('system')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs',
              colorMode === 'system'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <Monitor className="h-3 w-3" />
            Auto
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

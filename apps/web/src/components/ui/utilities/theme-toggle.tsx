'use client';

import * as React from 'react';
import {
  useTheme as useNextTheme,
  ThemeProvider as NextThemesProvider,
  type UseThemeProps,
} from 'next-themes';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/libs/utils';
import { Button, type ButtonProps } from '../forms/button';
import { FOCUS_RING } from '@/components/ui/constants';

/* ------------------------------------------------------------------ */
/* Re-exports & Types                                                 */
/* ------------------------------------------------------------------ */

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface UseThemeReturn extends UseThemeProps {
  toggleTheme: () => void;
}

/**
 * Enhanced useTheme hook powered by `next-themes` with convenience `toggleTheme` method.
 */
export function useTheme(): UseThemeReturn {
  const nextTheme = useNextTheme();

  const toggleTheme = React.useCallback(() => {
    const current = nextTheme.theme;
    if (current === 'light') {
      nextTheme.setTheme('dark');
    } else if (current === 'dark') {
      nextTheme.setTheme('system');
    } else {
      nextTheme.setTheme('light');
    }
  }, [nextTheme]);

  return {
    ...nextTheme,
    toggleTheme,
  };
}

// React 19 / Next.js 16 development filter: next-themes injects an inline script to prevent theme flash (FOUC)
// before hydration. React 19 warns about client scripts inside component renders.
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
      return;
    }
    originalError.apply(console, args);
  };
}

export interface ThemeProviderProps extends React.ComponentProps<typeof NextThemesProvider> {}

/**
 * Global ThemeProvider configured for Kalya design tokens (Tailwind CSS 4).
 * Defaults attribute to `data-theme` to integrate with `[data-theme='dark']`.
 */
export function ThemeProvider({
  children,
  attribute = 'data-theme',
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

/* ------------------------------------------------------------------ */
/* ThemeToggle Component                                              */
/* ------------------------------------------------------------------ */

export interface ThemeToggleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  showLabel?: boolean;
  cycleModes?: Theme[];
}

export function ThemeToggle({
  className,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  cycleModes = ['light', 'dark', 'system'],
  ...props
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    setTimeout(() => {
      if (active) {
        setMounted(true);
      }
    }, 0);
    return () => {
      active = false;
    };
  }, []);

  if (!mounted) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn(
          'relative h-10 w-10 rounded-full border border-border/40 opacity-60 pointer-events-none',
          className
        )}
        disabled
        aria-hidden="true"
      >
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const cycleTheme = () => {
    if (cycleModes.length === 2 && cycleModes.includes('light') && cycleModes.includes('dark')) {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
      return;
    }

    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    // Show Laptop icon if explicitly set to system
    if (theme === 'system') {
      return (
        <span className="relative flex items-center justify-center">
          <Laptop className="h-5 w-5 text-text-secondary" key="system" />
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-surface',
              resolvedTheme === 'dark' ? 'bg-accent' : 'bg-primary'
            )}
            title={`System (${resolvedTheme})`}
          />
        </span>
      );
    }
    // Show Sun or Moon depending on resolved theme
    if (resolvedTheme === 'dark') {
      return (
        <Moon
          className="h-5 w-5 text-accent drop-shadow-[0_0_8px_rgba(232,196,104,0.35)]"
          key="dark"
        />
      );
    }
    return (
      <Sun className="h-5 w-5 text-accent drop-shadow-[0_0_8px_rgba(217,119,6,0.35)]" key="light" />
    );
  };

  const themeLabels: Record<string, string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  };

  const currentThemeLabel = (theme && themeLabels[theme]) || 'System';

  return (
    <Button
      variant={variant}
      size={size}
      onClick={cycleTheme}
      className={cn(
        'relative overflow-hidden rounded-full cursor-pointer transition-all duration-200 hover:bg-surface-raised active:scale-95 border border-border/60 hover:border-border shadow-xs',
        size === 'icon' && 'h-10 w-10 p-0',
        FOCUS_RING.primary,
        className
      )}
      aria-label={`Current theme: ${theme || 'system'}. Click to change.`}
      title={`Theme: ${currentThemeLabel} (Click to toggle)`}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={(theme || '') + (resolvedTheme || '')}
          initial={{ y: 16, opacity: 0, rotate: -45, scale: 0.85 }}
          animate={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          exit={{ y: -16, opacity: 0, rotate: 45, scale: 0.85 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex items-center justify-center gap-2"
        >
          {getIcon()}
          {showLabel && <span className="text-body-sm font-medium pr-1">{currentThemeLabel}</span>}
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* ThemeSegmented Component (Interactive 3-Pill Switch)              */
/* ------------------------------------------------------------------ */

export interface ThemeSegmentedProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function ThemeSegmented({ className, size = 'md' }: ThemeSegmentedProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const options: { id: Theme; label: string; icon: React.ElementType }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Laptop },
  ];

  if (!mounted) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 p-1 rounded-full bg-surface-raised border border-border/80 opacity-60 pointer-events-none',
          size === 'sm' ? 'h-8' : 'h-10',
          className
        )}
      >
        {options.map((opt) => (
          <div
            key={opt.id}
            className={cn(
              'px-3 py-1 rounded-full text-caption text-text-muted flex items-center gap-1.5'
            )}
          >
            <opt.icon className="w-3.5 h-3.5" />
            <span>{opt.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Select color theme"
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-full bg-surface-raised border border-border/80 shadow-xs relative',
        size === 'sm' ? 'h-8 text-caption' : 'h-10 text-body-sm',
        className
      )}
    >
      {options.map((opt) => {
        const isActive = theme === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setTheme(opt.id)}
            className={cn(
              'relative z-10 px-3 py-1 rounded-full font-medium transition-colors duration-150 flex items-center gap-1.5 cursor-pointer select-none',
              FOCUS_RING.primary,
              isActive
                ? 'text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <Icon
              className={cn(
                'w-3.5 h-3.5 transition-colors',
                isActive && opt.id !== 'system' && 'text-accent'
              )}
            />
            <span>{opt.label}</span>

            {isActive && (
              <motion.div
                layoutId="theme-segmented-active"
                className="absolute inset-0 bg-surface rounded-full shadow-card border border-border/60 -z-10"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ThemeDropdown Component                                            */
/* ------------------------------------------------------------------ */

export function ThemeDropdown({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('h-9 px-3 gap-2 opacity-60', className)}
        disabled
      >
        <Sun className="h-4 w-4 text-accent" />
        <span className="text-body-sm">Theme</span>
      </Button>
    );
  }

  const getActiveIcon = () => {
    if (theme === 'system') {
      return <Laptop className="h-4 w-4 text-text-secondary" />;
    }
    if (resolvedTheme === 'dark') {
      return <Moon className="h-4 w-4 text-accent" />;
    }
    return <Sun className="h-4 w-4 text-accent" />;
  };

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'h-9 px-3 gap-2 rounded-md border-border bg-surface hover:bg-surface-raised shadow-xs',
            FOCUS_RING.primary,
            className
          )}
        >
          {getActiveIcon()}
          <span className="text-body-sm capitalize font-medium">{theme || 'system'}</span>
        </Button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-34 overflow-hidden rounded-md border border-border bg-surface p-1 shadow-card animate-in fade-in-80 zoom-in-95"
        >
          {(
            [
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Laptop },
            ] as const
          ).map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <DropdownMenuPrimitive.Item
                key={item.id}
                onClick={() => setTheme(item.id)}
                className={cn(
                  'relative flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-sm text-body-sm cursor-pointer select-none transition-colors outline-none',
                  isSelected
                    ? 'bg-primary-subtle text-primary font-medium'
                    : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn('h-4 w-4', item.id !== 'system' && isSelected && 'text-accent')}
                  />
                  <span>{item.label}</span>
                </div>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuPrimitive.Item>
            );
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

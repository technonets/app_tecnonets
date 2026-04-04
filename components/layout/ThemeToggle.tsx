'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-11 h-11" />;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-11 h-11 p-0 rounded-full bg-background/50 backdrop-blur-sm border-border/50 hover:bg-foreground/5 hover:border-primary/50 transition-all group scale-100 active:scale-95 shadow-sm"
      onClick={() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
      }}
      aria-label="Toggle theme"
    >
      <div className="relative w-7 h-7 flex items-center justify-center">
        {theme === 'dark' ? (
          <Sun className="h-6 w-6 text-yellow-500 transition-all duration-500 rotate-0 scale-100 group-hover:rotate-45 group-hover:scale-110" />
        ) : (
          <Moon className="h-6 w-6 text-primary transition-all duration-500 rotate-0 scale-100 group-hover:-rotate-12 group-hover:scale-110" />
        )}
      </div>
    </Button>
  );
}

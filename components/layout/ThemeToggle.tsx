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
    return <div className="p-2 w-10 h-10" />;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-10 h-10 p-0 rounded-full"
      onClick={() => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark';
        console.log('Switching theme to:', nextTheme);
        setTheme(nextTheme);
      }}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
      ) : (
        <Moon className="h-5 w-5 text-gray-500 hover:text-black transition-colors" />
      )}
    </Button>
  );
}

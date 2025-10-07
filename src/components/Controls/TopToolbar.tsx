'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Brain, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function TopToolbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className='h-12 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='h-full flex items-center justify-between px-4'>
        {/* Left side - Logo and title */}
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Brain className='h-6 w-6 text-primary' />
            <h1 className='text-lg font-bold'>Neural Network Visualizer</h1>
          </div>
        </div>

        {/* Center - Task type selector */}
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Task:</span>
            <Select defaultValue='classification'>
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='classification'>Classification</SelectItem>
                <SelectItem value='regression'>Regression</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right side - Theme toggle and other controls */}
        <div className='flex items-center gap-2'>
          {mounted && (
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='light'>
                  <div className='flex items-center gap-2'>
                    <Sun className='h-4 w-4' />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value='dark'>
                  <div className='flex items-center gap-2'>
                    <Moon className='h-4 w-4' />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value='system'>
                  <div className='flex items-center gap-2'>
                    <Monitor className='h-4 w-4' />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
}

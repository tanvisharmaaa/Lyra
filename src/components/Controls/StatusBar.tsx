'use client';

import { useState, useEffect } from 'react';
import { Activity, Cpu, Zap } from 'lucide-react';

export function StatusBar() {
  const [fps, setFps] = useState(60);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Simulate FPS monitoring
    const interval = setInterval(() => {
      setFps(Math.floor(Math.random() * 20) + 50); // Random FPS between 50-70
      setMemoryUsage(Math.floor(Math.random() * 100) + 50); // Random memory usage
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='h-8 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='h-full flex items-center justify-between px-4 text-xs text-muted-foreground'>
        {/* Left side - Training status */}
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1'>
            <Activity className='h-3 w-3' />
            <span>Status: Ready</span>
          </div>
          <div className='flex items-center gap-1'>
            <span>Epoch: 0/100</span>
          </div>
          <div className='flex items-center gap-1'>
            <span>Loss: --</span>
          </div>
          <div className='flex items-center gap-1'>
            <span>Accuracy: --</span>
          </div>
        </div>

        {/* Right side - Performance metrics */}
        <div className='flex items-center gap-4'>
          {mounted && (
            <>
              <div className='flex items-center gap-1'>
                <Zap className='h-3 w-3' />
                <span>FPS: {fps}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Cpu className='h-3 w-3' />
                <span>Memory: {memoryUsage}MB</span>
              </div>
            </>
          )}
          <div className='flex items-center gap-1'>
            <span>TensorFlow.js v4.22.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

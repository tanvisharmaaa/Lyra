'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { Canvas } from '@/components/Canvas/Canvas';
import { RightPanel } from '@/components/Panels/RightPanel';
import { TopToolbar } from '@/components/Controls/TopToolbar';
import { StatusBar } from '@/components/Controls/StatusBar';

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  return (
    <div className='h-screen flex flex-col bg-background'>
      {/* Top Toolbar */}
      <TopToolbar />

      {/* Main Content Area */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Left Sidebar */}
        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? 'w-0' : 'w-80'
          } border-r border-border`}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Center Canvas */}
        <div className='flex-1 relative'>
          <Canvas />
        </div>

        {/* Right Panel */}
        <div
          className={`transition-all duration-300 ${
            rightPanelCollapsed ? 'w-0' : 'w-80'
          } border-l border-border`}
        >
          <RightPanel
            collapsed={rightPanelCollapsed}
            onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)}
          />
        </div>
      </div>

      {/* Bottom Status Bar */}
      <StatusBar />
    </div>
  );
}

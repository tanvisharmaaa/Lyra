'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DatasetTab } from './Tabs/DatasetTab';
import { ModelTab } from './Tabs/ModelTab';
import { TrainingTab } from './Tabs/TrainingTab';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  if (collapsed) {
    return (
      <div className='h-full flex flex-col items-center py-4 border-r border-border'>
        <Button variant='ghost' size='sm' onClick={onToggle} className='mb-4'>
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col p-4 space-y-4 overflow-y-auto'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Neural Network Config</h2>
        <Button variant='ghost' size='sm' onClick={onToggle}>
          <ChevronLeft className='h-4 w-4' />
        </Button>
      </div>

      <Tabs defaultValue='dataset' className='flex-1'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='dataset'>Dataset</TabsTrigger>
          <TabsTrigger value='model'>Model</TabsTrigger>
          <TabsTrigger value='training'>Training</TabsTrigger>
        </TabsList>

        {/* Dataset Tab */}
        <TabsContent value='dataset'>
          <DatasetTab />
        </TabsContent>

        {/* Model Tab */}
        <TabsContent value='model'>
          <ModelTab />
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value='training'>
          <TrainingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

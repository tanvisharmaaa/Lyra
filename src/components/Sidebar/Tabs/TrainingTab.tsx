'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

export function TrainingTab() {
  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-4 w-4' />
            Hyperparameters
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label>Learning Rate</Label>
            <Input
              type='number'
              defaultValue='0.001'
              step='0.0001'
              min='0.0001'
              max='1'
            />
          </div>
          <div>
            <Label>Epochs</Label>
            <Input type='number' defaultValue='100' min='1' max='1000' />
          </div>
          <div>
            <Label>Batch Size</Label>
            <Input type='number' defaultValue='32' min='1' max='256' />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

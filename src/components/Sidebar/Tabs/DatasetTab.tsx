'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

export function DatasetTab() {
  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Upload className='h-4 w-4' />
            Upload Dataset
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <Label htmlFor='file-upload'>CSV File</Label>
            <Input
              id='file-upload'
              type='file'
              accept='.csv'
              className='mt-1'
            />
          </div>
          <div className='text-sm text-muted-foreground'>
            <p>Supported formats: CSV</p>
            <p>Auto-detects target column</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dataset Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-muted-foreground'>
            <p>No dataset loaded</p>
            <p>Upload a CSV file to begin</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

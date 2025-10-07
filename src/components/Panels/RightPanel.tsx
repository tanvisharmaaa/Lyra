'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RightPanelProps {
  collapsed: boolean;
  onToggle: () => void;
}

// Mock data for charts
const mockLossData = [
  { epoch: 1, loss: 0.8, accuracy: 0.3 },
  { epoch: 2, loss: 0.6, accuracy: 0.5 },
  { epoch: 3, loss: 0.4, accuracy: 0.7 },
  { epoch: 4, loss: 0.3, accuracy: 0.8 },
  { epoch: 5, loss: 0.25, accuracy: 0.85 },
];

const mockMetricsData = [
  { epoch: 1, train_loss: 0.8, val_loss: 0.9, train_acc: 0.3, val_acc: 0.25 },
  { epoch: 2, train_loss: 0.6, val_loss: 0.7, train_acc: 0.5, val_acc: 0.45 },
  { epoch: 3, train_loss: 0.4, val_loss: 0.5, train_acc: 0.7, val_acc: 0.65 },
  { epoch: 4, train_loss: 0.3, val_loss: 0.4, train_acc: 0.8, val_acc: 0.75 },
  { epoch: 5, train_loss: 0.25, val_loss: 0.35, train_acc: 0.85, val_acc: 0.8 },
];

export function RightPanel({ collapsed, onToggle }: RightPanelProps) {
  if (collapsed) {
    return (
      <div className='h-full flex flex-col items-center py-4 border-l border-border'>
        <Button variant='ghost' size='sm' onClick={onToggle} className='mb-4'>
          <ChevronLeft className='h-4 w-4' />
        </Button>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col p-4 space-y-4 overflow-y-auto'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>Training Monitor</h2>
        <Button variant='ghost' size='sm' onClick={onToggle}>
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>

      <Tabs defaultValue='charts' className='flex-1'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='charts' className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            Charts
          </TabsTrigger>
          <TabsTrigger value='metrics' className='flex items-center gap-2'>
            <Activity className='h-4 w-4' />
            Metrics
          </TabsTrigger>
          <TabsTrigger value='logs' className='flex items-center gap-2'>
            <FileText className='h-4 w-4' />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Charts Tab */}
        <TabsContent value='charts' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Loss Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={mockLossData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='epoch' />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type='monotone'
                      dataKey='loss'
                      stroke='#ef4444'
                      strokeWidth={2}
                      name='Loss'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={mockLossData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='epoch' />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type='monotone'
                      dataKey='accuracy'
                      stroke='#22c55e'
                      strokeWidth={2}
                      name='Accuracy'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value='metrics' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Training vs Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart data={mockMetricsData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='epoch' />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type='monotone'
                      dataKey='train_loss'
                      stroke='#3b82f6'
                      strokeWidth={2}
                      name='Train Loss'
                    />
                    <Line
                      type='monotone'
                      dataKey='val_loss'
                      stroke='#ef4444'
                      strokeWidth={2}
                      name='Val Loss'
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Metrics</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Current Loss:
                </span>
                <span className='font-mono'>0.234</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Accuracy:</span>
                <span className='font-mono'>85.2%</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>Epoch:</span>
                <span className='font-mono'>5/100</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Learning Rate:
                </span>
                <span className='font-mono'>0.001</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value='logs' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Training Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64 overflow-y-auto font-mono text-sm space-y-1'>
                <div className='text-green-600'>[INFO] Training started</div>
                <div className='text-blue-600'>
                  [INFO] Epoch 1/100 - Loss: 0.800 - Accuracy: 30.0%
                </div>
                <div className='text-blue-600'>
                  [INFO] Epoch 2/100 - Loss: 0.600 - Accuracy: 50.0%
                </div>
                <div className='text-blue-600'>
                  [INFO] Epoch 3/100 - Loss: 0.400 - Accuracy: 70.0%
                </div>
                <div className='text-blue-600'>
                  [INFO] Epoch 4/100 - Loss: 0.300 - Accuracy: 80.0%
                </div>
                <div className='text-blue-600'>
                  [INFO] Epoch 5/100 - Loss: 0.250 - Accuracy: 85.0%
                </div>
                <div className='text-yellow-600'>
                  [WARN] Learning rate might be too high
                </div>
                <div className='text-green-600'>
                  [INFO] Model saved checkpoint
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

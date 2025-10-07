'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Brain,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [hiddenLayers, setHiddenLayers] = useState([2]);
  const [neuronsPerLayer, setNeuronsPerLayer] = useState([32]);
  const [taskType, setTaskType] = useState('classification');
  const [activationFunction, setActivationFunction] = useState('relu');

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
        <TabsContent value='dataset' className='space-y-4'>
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
        </TabsContent>

        {/* Model Tab */}
        <TabsContent value='model' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Brain className='h-4 w-4' />
                Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label>Task Type</Label>
                <Select value={taskType} onValueChange={setTaskType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='classification'>
                      Classification
                    </SelectItem>
                    <SelectItem value='regression'>Regression</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Hidden Layers: {hiddenLayers[0]}</Label>
                <Slider
                  value={hiddenLayers}
                  onValueChange={setHiddenLayers}
                  max={5}
                  min={1}
                  step={1}
                  className='mt-2'
                />
              </div>

              <div>
                <Label>Neurons per Layer: {neuronsPerLayer[0]}</Label>
                <Slider
                  value={neuronsPerLayer}
                  onValueChange={setNeuronsPerLayer}
                  max={128}
                  min={8}
                  step={8}
                  className='mt-2'
                />
              </div>

              <div>
                <Label>Activation Function</Label>
                <Select
                  value={activationFunction}
                  onValueChange={setActivationFunction}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='relu'>ReLU</SelectItem>
                    <SelectItem value='sigmoid'>Sigmoid</SelectItem>
                    <SelectItem value='tanh'>Tanh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value='training' className='space-y-4'>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

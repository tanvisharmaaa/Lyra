'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Brain } from 'lucide-react';
import { useState } from 'react';

export function ModelTab() {
  const [hiddenLayers, setHiddenLayers] = useState([2]);
  const [neuronsPerLayer, setNeuronsPerLayer] = useState([32]);
  const [taskType, setTaskType] = useState('classification');
  const [activationFunction, setActivationFunction] = useState('relu');

  return (
    <div className='space-y-4'>
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
                <SelectItem value='classification'>Classification</SelectItem>
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
    </div>
  );
}

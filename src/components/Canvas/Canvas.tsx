'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Maximize2 } from 'lucide-react';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial drawing
    drawNeuralNetwork(ctx, canvas.offsetWidth, canvas.offsetHeight);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const drawNeuralNetwork = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up neural network visualization
    const layers = 4; // Input, 2 hidden, output
    const neuronsPerLayer = [4, 8, 8, 2]; // Example configuration
    const layerSpacing = width / (layers + 1);
    const neuronRadius = 20;

    // Draw layers
    for (let layer = 0; layer < layers; layer++) {
      const x = layerSpacing * (layer + 1);
      const neuronsInLayer = neuronsPerLayer[layer];
      const neuronSpacing = height / (neuronsInLayer + 1);

      // Draw neurons
      for (let neuron = 0; neuron < neuronsInLayer; neuron++) {
        const y = neuronSpacing * (neuron + 1);

        // Draw neuron circle
        ctx.beginPath();
        ctx.arc(x, y, neuronRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#3b82f6'; // Blue for neurons
        ctx.fill();
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw connections to next layer
        if (layer < layers - 1) {
          const nextLayerNeurons = neuronsPerLayer[layer + 1];
          const nextLayerSpacing = height / (nextLayerNeurons + 1);

          for (
            let nextNeuron = 0;
            nextNeuron < nextLayerNeurons;
            nextNeuron++
          ) {
            const nextY = nextLayerSpacing * (nextNeuron + 1);
            const nextX = layerSpacing * (layer + 2);

            ctx.beginPath();
            ctx.moveTo(x + neuronRadius, y);
            ctx.lineTo(nextX - neuronRadius, nextY);
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    // Draw title
    ctx.fillStyle = '#374151';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Neural Network Visualization', width / 2, 30);
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setIsPaused(false);
    // TODO: Start training animation
  };

  const handlePauseTraining = () => {
    setIsPaused(!isPaused);
    // TODO: Pause/resume training
  };

  const handleResetTraining = () => {
    setIsTraining(false);
    setIsPaused(false);
    // TODO: Reset training state
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Canvas Header */}
      <div className='flex items-center justify-between p-4 border-b border-border'>
        <h2 className='text-lg font-semibold'>Neural Network Canvas</h2>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleStartTraining}
            disabled={isTraining && !isPaused}
          >
            <Play className='h-4 w-4 mr-2' />
            Start
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handlePauseTraining}
            disabled={!isTraining}
          >
            {isPaused ? (
              <Play className='h-4 w-4 mr-2' />
            ) : (
              <Pause className='h-4 w-4 mr-2' />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant='outline' size='sm' onClick={handleResetTraining}>
            <RotateCcw className='h-4 w-4 mr-2' />
            Reset
          </Button>
          <Button variant='ghost' size='sm'>
            <Maximize2 className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className='flex-1 relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20'>
        <canvas
          ref={canvasRef}
          className='w-full h-full'
          style={{ background: 'transparent' }}
        />

        {/* Overlay for when no model is loaded */}
        {!isTraining && (
          <div className='absolute inset-0 flex items-center justify-center'>
            <Card className='p-8 text-center'>
              <h3 className='text-lg font-semibold mb-2'>Ready to Visualize</h3>
              <p className='text-muted-foreground mb-4'>
                Configure your neural network in the sidebar and start training
                to see the visualization.
              </p>
              <div className='text-sm text-muted-foreground'>
                <p>• Upload a dataset</p>
                <p>• Configure model architecture</p>
                <p>• Start training to see animations</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

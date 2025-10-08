'use client';

import { CSVPreviewModal } from '@/components/DatasetUpload/CSVPreviewModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useIngestion } from '@/lib/data/useIngestion';
import { useNeuralNetworkStore } from '@/store/state';
import { Upload } from 'lucide-react';
import { useState } from 'react';
import { DATA_LIMITS } from '@/lib/config/appConfig';

export function DatasetTab() {
  const { dataset, setDataset } = useNeuralNetworkStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const {
    state,
    loadRawText,
    updateConfig,
    setTarget,
    toggleFeature,
    setGlobalStrategy,
    setColumnStrategy,
    setColumnConstant,
    finalize,
    reset,
  } = useIngestion();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > DATA_LIMITS.maxFileBytes) {
      setError(
        `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds limit ${(DATA_LIMITS.maxFileBytes / 1024 / 1024).toFixed(0)}MB`
      );
      return;
    }
    setError(null);
    setSelectedFile(file);

    try {
      const text = await file.text();
      loadRawText(text);
      setPreviewModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    }
  };

  const handleConfirmUpload = () => {
    setIsLoading(true);
    setError(null);
    const { dataset: ds, error: err } = finalize();
    if (err || !ds) {
      setError(err || 'Failed to finalize dataset');
      setIsLoading(false);
      return;
    }
    setDataset(ds);
    setPreviewModalOpen(false);
    reset();
    setSelectedFile(null);
    const fileInput = document.getElementById(
      'file-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setIsLoading(false);
  };

  const handleCancelUpload = () => {
    setPreviewModalOpen(false);
    reset();
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.getElementById(
      'file-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

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
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </div>
          <div className='text-sm text-muted-foreground'>
            <p>Supported formats: CSV</p>
            <p>Auto-detects target column</p>
          </div>
          {isLoading && (
            <div className='text-sm text-blue-600'>
              Loading and parsing CSV file...
            </div>
          )}
          {error && <div className='text-sm text-red-600'>Error: {error}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dataset Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {dataset ? (
            <div className='space-y-2 text-sm'>
              <p>
                <strong>Samples:</strong> {dataset.numSamples}
              </p>
              <p>
                <strong>Features:</strong> {dataset.numFeatures}
              </p>
              <p>
                <strong>Target:</strong> {dataset.target}
              </p>
              <p>
                <strong>Type:</strong> {dataset.targetType}
              </p>
              {dataset.numClasses && (
                <p>
                  <strong>Classes:</strong> {dataset.numClasses}
                </p>
              )}
              <p>
                <strong>Feature columns:</strong> {dataset.features.join(', ')}
              </p>
            </div>
          ) : (
            <div className='text-sm text-muted-foreground'>
              <p>No dataset loaded</p>
              <p>Upload a CSV file to begin</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSV Preview Modal */}
      <CSVPreviewModal
        isOpen={previewModalOpen}
        onClose={handleCancelUpload}
        onConfirm={handleConfirmUpload}
        fileName={selectedFile?.name || ''}
        isLoading={isLoading}
        config={state.config}
        preview={state.preview}
        updateConfig={updateConfig}
        setTarget={setTarget}
        toggleFeature={toggleFeature}
        setGlobalStrategy={setGlobalStrategy}
        setColumnStrategy={setColumnStrategy}
        setColumnConstant={setColumnConstant}
      />
    </div>
  );
}

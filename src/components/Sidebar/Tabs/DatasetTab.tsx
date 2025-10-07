'use client';

import { CSVPreviewModal } from '@/components/DatasetUpload/CSVPreviewModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parseCSVFile } from '@/lib/data/parser';
import { useNeuralNetworkStore } from '@/store/state';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';
import { useState } from 'react';

export function DatasetTab() {
  const { dataset, setDataset } = useNeuralNetworkStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<
    Record<string, string | number>[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSelectedFile(file);

    try {
      // Parse CSV for preview (first 50 rows)
      const text = await file.text();
      const result = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        preview: 50, // Only parse first 50 rows for preview
      });

      if (result.errors.length > 0) {
        setError(
          `CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`
        );
        return;
      }

      const data = result.data as Record<string, string | number>[];
      if (data.length === 0) {
        setError('CSV file is empty or contains no valid data');
        return;
      }

      setPreviewData(data);
      setPreviewModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    }
  };

  const handleConfirmUpload = async (config: {
    skipRows: number;
    headerRow: number;
    targetColumn: string;
    featureColumns: string[];
  }) => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await parseCSVFile(selectedFile);

      if (result.success && result.data) {
        // Apply user configuration to the dataset
        const configuredDataset = {
          ...result.data,
          target: config.targetColumn,
          features: config.featureColumns,
        };

        setDataset(configuredDataset);
        setPreviewModalOpen(false);
        setPreviewData([]);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById(
          'file-upload'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(result.error || 'Failed to parse CSV file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelUpload = () => {
    setPreviewModalOpen(false);
    setPreviewData([]);
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
        csvData={previewData}
        fileName={selectedFile?.name || ''}
        isLoading={isLoading}
      />
    </div>
  );
}

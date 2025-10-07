'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, FileText, X, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CSVTable } from './CSVTable';

interface CSVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: {
    skipRows: number;
    headerRow: number;
    targetColumn: string;
    featureColumns: string[];
  }) => void;
  csvData: Record<string, string | number>[];
  fileName: string;
  isLoading?: boolean;
}

export function CSVPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  csvData,
  fileName,
  isLoading = false,
}: CSVPreviewModalProps) {
  const [skipRows, setSkipRows] = useState(0);
  const [headerRow, setHeaderRow] = useState(0);
  const [targetColumn, setTargetColumn] = useState('');
  const [featureColumns, setFeatureColumns] = useState<string[]>([]);
  const [showToolbar, setShowToolbar] = useState(false);

  const previewData = csvData.slice(0, 50);
  const totalRows = csvData.length;
  const hasMoreRows = totalRows > 50;

  // Get available columns from the first row
  const availableColumns = csvData.length > 0 ? Object.keys(csvData[0]) : [];

  // Initialize target column and feature columns when data changes
  useEffect(() => {
    if (availableColumns.length > 0) {
      if (!targetColumn) {
        setTargetColumn(availableColumns[availableColumns.length - 1]); // Default to last column
      }
      if (featureColumns.length === 0) {
        setFeatureColumns(availableColumns.slice(0, -1)); // Default to all except last
      }
    }
  }, [availableColumns, targetColumn, featureColumns.length]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    onConfirm({
      skipRows,
      headerRow,
      targetColumn,
      featureColumns,
    });
  };

  const toggleFeatureColumn = (column: string) => {
    setFeatureColumns(prev =>
      prev.includes(column) ? prev.filter(c => c !== column) : [...prev, column]
    );
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className='relative bg-background border rounded-lg shadow-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            <h2 className='text-lg font-semibold'>CSV Preview: {fileName}</h2>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowToolbar(!showToolbar)}
              className='flex items-center gap-2'
            >
              <Settings className='h-4 w-4' />
              {showToolbar ? 'Hide' : 'Show'} Settings
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='h-8 w-8 p-0'
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Settings Toolbar */}
        {showToolbar && (
          <div className='p-4 border-b bg-muted/30 space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {/* Skip Rows */}
              <div className='space-y-2'>
                <Label htmlFor='skip-rows' className='text-sm font-medium'>
                  Skip Rows
                </Label>
                <Input
                  id='skip-rows'
                  type='number'
                  min='0'
                  value={skipRows}
                  onChange={e => setSkipRows(parseInt(e.target.value) || 0)}
                  className='h-8'
                />
              </div>

              {/* Header Row */}
              <div className='space-y-2'>
                <Label htmlFor='header-row' className='text-sm font-medium'>
                  Header Row
                </Label>
                <Input
                  id='header-row'
                  type='number'
                  min='0'
                  value={headerRow}
                  onChange={e => setHeaderRow(parseInt(e.target.value) || 0)}
                  className='h-8'
                />
              </div>

              {/* Target Column */}
              <div className='space-y-2'>
                <Label htmlFor='target-column' className='text-sm font-medium'>
                  Target Column
                </Label>
                <Select value={targetColumn} onValueChange={setTargetColumn}>
                  <SelectTrigger className='h-8'>
                    <SelectValue placeholder='Select target column' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map(column => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Feature Columns Count */}
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Feature Columns</Label>
                <div className='text-sm text-muted-foreground'>
                  {featureColumns.length} selected
                </div>
              </div>
            </div>

            {/* Feature Columns Selection */}
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>
                Select Feature Columns
              </Label>
              <div className='flex flex-wrap gap-2'>
                {availableColumns.map(column => (
                  <Button
                    key={column}
                    variant={
                      featureColumns.includes(column) ? 'default' : 'outline'
                    }
                    size='sm'
                    onClick={() => toggleFeatureColumn(column)}
                    className='h-7 text-xs'
                    disabled={column === targetColumn}
                  >
                    {column}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Info */}
        <div className='px-6 py-3 border-b bg-muted/30'>
          <div className='flex items-center justify-between text-sm text-muted-foreground'>
            <div className='flex items-center gap-4'>
              <span>Showing first 50 rows</span>
              {hasMoreRows && (
                <span className='text-amber-600 font-medium'>
                  ({totalRows - 50} more rows will be included)
                </span>
              )}
            </div>
            <span className='font-medium'>Total: {totalRows} rows</span>
          </div>
        </div>

        {/* Table Container */}
        <div
          className='flex-1 p-6'
          style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}
        >
          <div
            className='border rounded-lg bg-background'
            style={{
              overflow: 'auto',
              minHeight: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <CSVTable data={previewData} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center justify-end gap-3 p-6 border-t bg-muted/30'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isLoading}
            className='flex items-center gap-2'
          >
            <X className='h-4 w-4' />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className='flex items-center gap-2'
          >
            {isLoading ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent' />
                Loading...
              </>
            ) : (
              <>
                <Check className='h-4 w-4' />
                Confirm & Load Dataset
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

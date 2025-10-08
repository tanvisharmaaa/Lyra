'use client';

import React, { useEffect } from 'react';
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
import { Check, FileText, Settings, X } from 'lucide-react';
import { CSVTable } from './CSVTable';
import {
  IngestionConfig,
  PreviewResult,
  SimpleMissingStrategy,
  ColumnMissingStrategy,
} from '@/lib/data/parser';

export interface ControlledCSVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
  isLoading?: boolean;
  config: IngestionConfig;
  preview: PreviewResult | null;
  updateConfig: (patch: Partial<IngestionConfig>) => void;
  setTarget: (col: string) => void;
  toggleFeature: (col: string) => void;
  setGlobalStrategy?: (s: SimpleMissingStrategy) => void;
  setColumnStrategy?: (col: string, strategy: ColumnMissingStrategy) => void;
  setColumnConstant?: (col: string, value: string | number) => void;
}

export function CSVPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  fileName,
  isLoading = false,
  config,
  preview,
  updateConfig,
  setTarget,
  toggleFeature,
  setGlobalStrategy,
  setColumnStrategy,
  setColumnConstant,
}: ControlledCSVPreviewModalProps) {
  const [showToolbar, setShowToolbar] = React.useState(false);
  const skipRows = config.skipRows;
  const headerRow = config.headerRow;
  const targetColumn = config.targetColumn || '';
  const featureColumns = config.featureColumns || [];
  const globalStrategy = config.globalStrategy || 'leave-as-is';
  const columnStrategies = config.columnStrategies || {};
  const [showColumnPanel, setShowColumnPanel] = React.useState(false);
  const totalRawRows = preview?.rawRowCount || 0;
  const headerAbsoluteIndex = preview?.headerAbsoluteIndex ?? 0;
  const dataStartIndex = preview?.dataStartIndex ?? 0;
  const availableColumns = preview?.columns || [];
  const previewData = preview?.previewRecords || [];
  // Derive effective per-column strategy (override -> global)
  const effectiveStrategies: Record<
    string,
    ColumnMissingStrategy | SimpleMissingStrategy
  > = {};
  availableColumns.forEach(col => {
    const override = columnStrategies[col];
    if (override !== undefined) effectiveStrategies[col] = override;
    else effectiveStrategies[col] = globalStrategy;
  });
  // Precompute replacement values for preview display (mean/median/mode) using only preview rows AFTER header (approximation)
  const replacementValues: Record<string, string | number> = {};
  if (preview?.stats) {
    availableColumns.forEach(col => {
      const strat = effectiveStrategies[col];
      if (!strat) return;
      const type = typeof strat === 'string' ? strat : strat.type;
      if (type === 'zero') {
        replacementValues[col] = 0;
      } else if (type === 'constant') {
        if (typeof strat === 'object') replacementValues[col] = strat.value;
      } else if (['mean', 'median', 'mode'].includes(type)) {
        // Collect column values from data rows in preview (exclude header and skipped)
        const colValues: (string | number)[] = [];
        previewData.forEach((rec, idx) => {
          if (
            idx >= dataStartIndex &&
            rec[col] !== '' &&
            rec[col] !== null &&
            rec[col] !== undefined
          ) {
            colValues.push(rec[col]);
          }
        });
        if (colValues.length) {
          if (type === 'mode') {
            const counts = new Map<string, number>();
            colValues.forEach(v => {
              const k = v.toString();
              counts.set(k, (counts.get(k) || 0) + 1);
            });
            let best = colValues[0].toString();
            let bestC = 0;
            counts.forEach((c, v) => {
              if (c > bestC) {
                bestC = c;
                best = v;
              }
            });
            replacementValues[col] = best;
          } else {
            const nums = colValues.map(v => Number(v)).filter(v => !isNaN(v));
            if (nums.length) {
              if (type === 'mean') {
                replacementValues[col] =
                  nums.reduce((s, v) => s + v, 0) / nums.length;
              } else if (type === 'median') {
                const sorted = [...nums].sort((a, b) => a - b);
                const mid = Math.floor(sorted.length / 2);
                replacementValues[col] =
                  sorted.length % 2 === 0
                    ? (sorted[mid - 1] + sorted[mid]) / 2
                    : sorted[mid];
              }
            }
          }
        }
      }
    });
  }
  // Compute rows that would be dropped under any drop-row strategy (union of columns using drop-row)
  const dropRowColumns = availableColumns.filter(c => {
    const s = effectiveStrategies[c];
    const type = typeof s === 'string' ? s : s?.type;
    return type === 'drop-row';
  });
  const rowsToDrop = new Set<number>();
  if (dropRowColumns.length && preview?.cellFlags) {
    preview.cellFlags.forEach((flags, rIdx) => {
      if (rIdx < dataStartIndex) return; // only data rows
      dropRowColumns.forEach((col, _ci) => {
        const colIndex = availableColumns.indexOf(col);
        const flag = flags[colIndex];
        if (flag === 'missing' || flag === 'placeholder') {
          rowsToDrop.add(rIdx);
        }
      });
    });
  }
  const hasMoreRows =
    preview && preview.rawRowCount !== undefined
      ? preview.rawRowCount - dataStartIndex > previewData.length
      : false;
  const totalDataRows = preview
    ? Math.max((preview.rawRowCount || 0) - dataStartIndex, 0)
    : 0;
  const limitErrors = preview?.limitErrors || [];
  const hasLimitErrors = limitErrors.length > 0;

  // Escape key & scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative bg-background border rounded-lg shadow-lg w-full h-full max-w-7xl max-h-[90vh] flex flex-col'>
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            <h2 className='text-lg font-semibold'>CSV Preview: {fileName}</h2>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowToolbar(!showToolbar)}
            className='flex items-center gap-2'
          >
            <Settings className='h-4 w-4' /> {showToolbar ? 'Hide' : 'Show'}{' '}
            Settings
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
        {showToolbar && (
          <div className='p-4 border-b bg-muted/30 space-y-4'>
            {hasLimitErrors && (
              <div className='rounded-md border border-red-300 bg-red-50 dark:bg-red-900/30 p-3 text-xs text-red-700 dark:text-red-300 space-y-1'>
                <div className='font-semibold'>Dataset limit violations</div>
                <ul className='list-disc ml-4'>
                  {limitErrors.map((e, i) => (
                    <li key={i}>{e.message}</li>
                  ))}
                </ul>
                <div>Adjust or trim your file and re-upload to proceed.</div>
              </div>
            )}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='skip-rows' className='text-sm font-medium'>
                  Skip Rows
                </Label>
                <Input
                  id='skip-rows'
                  type='number'
                  min='0'
                  value={skipRows}
                  onChange={e =>
                    updateConfig({
                      skipRows: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className='h-8'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='header-row' className='text-sm font-medium'>
                  Header Row
                </Label>
                <Input
                  id='header-row'
                  type='number'
                  min='0'
                  value={headerRow}
                  onChange={e =>
                    updateConfig({
                      headerRow: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className='h-8'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='target-column' className='text-sm font-medium'>
                  Target Column
                </Label>
                <Select value={targetColumn} onValueChange={setTarget}>
                  <SelectTrigger className='h-8'>
                    <SelectValue placeholder='Select target column' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map(c => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Feature Columns</Label>
                <div className='text-sm text-muted-foreground'>
                  {featureColumns.length} selected
                </div>
              </div>
              <div className='space-y-2'>
                <Label className='text-sm font-medium'>
                  Global Strategy (Fallback)
                </Label>
                <Select
                  value={globalStrategy}
                  onValueChange={val =>
                    setGlobalStrategy &&
                    setGlobalStrategy(val as SimpleMissingStrategy)
                  }
                >
                  <SelectTrigger className='h-8'>
                    <SelectValue placeholder='Global strategy' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='leave-as-is'>Leave As Is</SelectItem>
                    <SelectItem value='drop-row'>Drop Row</SelectItem>
                    <SelectItem value='zero'>Zero Fill</SelectItem>
                    <SelectItem value='mean'>Mean</SelectItem>
                    <SelectItem value='median'>Median</SelectItem>
                    <SelectItem value='mode'>Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='space-y-2'>
              <Label className='text-sm font-medium'>
                Select Feature Columns
              </Label>
              <div className='flex flex-wrap gap-2'>
                {availableColumns.map(col => {
                  const selected = featureColumns.includes(col);
                  const isTarget = col === targetColumn;
                  return (
                    <Button
                      key={col}
                      variant={selected ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => !isTarget && toggleFeature(col)}
                      className={`h-7 text-xs ${selected ? 'ring-2 ring-offset-1 ring-primary' : ''} ${isTarget ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={isTarget}
                      title={
                        isTarget
                          ? 'Target column (not a feature)'
                          : selected
                            ? 'Click to remove feature'
                            : 'Click to add as feature'
                      }
                    >
                      {col}
                    </Button>
                  );
                })}
              </div>
            </div>
            {/* Column Strategies Panel */}
            {preview?.stats && (
              <div className='space-y-2 pt-2 border-t'>
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>
                    Column Strategies & Stats
                  </Label>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-6 px-2 text-xs'
                    onClick={() => setShowColumnPanel(p => !p)}
                  >
                    {showColumnPanel ? 'Hide' : 'Show'}
                  </Button>
                </div>
                {showColumnPanel && (
                  <div className='max-h-56 overflow-auto border rounded-md divide-y'>
                    {availableColumns.map(col => {
                      const st = preview.stats![col];
                      const override = columnStrategies[col];
                      const overrideType =
                        typeof override === 'string'
                          ? override
                          : override && override.type;
                      const constValue =
                        typeof override === 'object' &&
                        override &&
                        override.type === 'constant'
                          ? override.value
                          : '';
                      const missingTotal =
                        st.missing + (st.placeholderMissing || 0);
                      const denom = Math.max(
                        1,
                        (preview.previewRecords || []).length -
                          (headerAbsoluteIndex + 1)
                      );
                      const missingPct = ((missingTotal / denom) * 100).toFixed(
                        1
                      );
                      const placeholderPct = st.placeholderMissing
                        ? ((st.placeholderMissing / denom) * 100).toFixed(1)
                        : '0.0';
                      const dropdownValue =
                        overrideType === undefined
                          ? globalStrategy
                          : overrideType === 'constant'
                            ? 'constant'
                            : overrideType;
                      return (
                        <div
                          key={col}
                          className='flex items-start gap-3 p-2 text-xs'
                        >
                          <div className='w-40 break-words font-mono'>
                            {col}
                          </div>
                          <div className='flex flex-col gap-1 min-w-[140px]'>
                            <div className='flex gap-2 flex-wrap'>
                              <span className='px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border text-neutral-700 dark:text-neutral-300'>
                                Miss {missingPct}%
                              </span>
                              <span className='px-1.5 py-0.5 rounded bg-fuchsia-100 dark:bg-fuchsia-900/40 border text-fuchsia-700 dark:text-fuchsia-300'>
                                Ph {placeholderPct}%
                              </span>
                              <span className='px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 border text-blue-700 dark:text-blue-300'>
                                {st.inferredType}
                              </span>
                            </div>
                            <Select
                              value={dropdownValue}
                              onValueChange={val => {
                                if (!setColumnStrategy) return;
                                if (val === 'constant') {
                                  setColumnStrategy(col, {
                                    type: 'constant',
                                    value: constValue || '',
                                  });
                                } else {
                                  setColumnStrategy(
                                    col,
                                    val as SimpleMissingStrategy
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className='h-7 text-xs'>
                                <SelectValue placeholder={globalStrategy} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='leave-as-is'>
                                  Leave As Is
                                </SelectItem>
                                <SelectItem value='drop-row'>
                                  Drop Row
                                </SelectItem>
                                <SelectItem value='zero'>Zero</SelectItem>
                                <SelectItem value='mean'>Mean</SelectItem>
                                <SelectItem value='median'>Median</SelectItem>
                                <SelectItem value='mode'>Mode</SelectItem>
                                <SelectItem value='constant'>
                                  Constant...
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {dropdownValue === 'constant' && (
                              <Input
                                placeholder='Value'
                                className='h-7 text-xs'
                                value={constValue}
                                onChange={e =>
                                  setColumnConstant &&
                                  setColumnConstant(col, e.target.value)
                                }
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        <div className='px-6 py-3 border-b bg-muted/30'>
          <div className='flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground'>
            <div className='flex flex-wrap items-center gap-4'>
              <span>
                Raw Rows: <strong>{totalRawRows}</strong> | Skipped:{' '}
                <strong>{skipRows}</strong> | Header at row{' '}
                <strong>{headerAbsoluteIndex + 1}</strong>
              </span>
              <span>
                Data rows after header: <strong>{totalDataRows}</strong>
              </span>
              <span>
                Columns: <strong>{availableColumns.length}</strong> (Features:{' '}
                <strong>{featureColumns.length}</strong>
                {targetColumn && `, Target: ${targetColumn}`})
              </span>
              <span>
                Previewing first {preview?.config?.previewLimit} rows
                {hasMoreRows && (
                  <span className='text-amber-600 font-medium'>
                    {' '}
                    (more not shown)
                  </span>
                )}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                <span className='h-3 w-3 rounded-sm bg-emerald-200 dark:bg-emerald-900/50 border border-emerald-500' />
                <span>Data Region</span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='h-3 w-3 rounded-sm bg-amber-50 dark:bg-amber-900/30 border border-amber-400' />
                <span>Missing Value</span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='h-3 w-3 rounded-sm bg-fuchsia-50 dark:bg-fuchsia-900/30 border border-fuchsia-400' />
                <span>Placeholder</span>
              </div>
            </div>
          </div>
        </div>
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
            <CSVTable
              data={previewData}
              originalRowOffset={0}
              highlightRange={{
                start: Math.max(dataStartIndex, 0),
                end: previewData.length - 1,
              }}
              meta={{
                skippedCount: skipRows,
                headerIndex: headerAbsoluteIndex,
                dataStartIndex,
              }}
              cellFlags={preview?.cellFlags}
              strategyPreview={{
                effective: effectiveStrategies,
                replacements: replacementValues,
                rowsToDrop,
              }}
            />
          </div>
        </div>
        <div className='flex items-center justify-end gap-3 p-6 border-t bg-muted/30'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isLoading}
            className='flex items-center gap-2'
          >
            <X className='h-4 w-4' /> Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || hasLimitErrors}
            className='flex items-center gap-2'
            title={
              hasLimitErrors
                ? 'Resolve dataset limit violations to proceed'
                : undefined
            }
          >
            {isLoading ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent' />{' '}
                Loading...
              </>
            ) : (
              <>
                <Check className='h-4 w-4' /> Confirm & Load Dataset
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

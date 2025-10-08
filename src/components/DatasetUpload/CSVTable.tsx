'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnMissingStrategy,
  SimpleMissingStrategy,
} from '@/lib/data/parser';

interface CSVTableProps {
  data: Record<string, string | number>[];
  originalRowOffset?: number; // number added to display index
  highlightRange?: { start: number; end: number };
  meta?: {
    skippedCount: number; // number of rows considered skipped (dim)
    headerIndex: number; // absolute header row index within preview coordinate space (0-based)
    dataStartIndex: number; // absolute first data row index
  };
  cellFlags?: ('missing' | 'placeholder' | 'valid')[][]; // classification matrix aligned with data rows
  strategyPreview?: {
    effective: Record<string, ColumnMissingStrategy | SimpleMissingStrategy>;
    replacements: Record<string, string | number>;
    rowsToDrop: Set<number>;
  };
}

export function CSVTable({
  data,
  originalRowOffset = 0,
  highlightRange,
  meta,
  cellFlags,
  strategyPreview,
}: CSVTableProps) {
  if (data.length === 0) {
    return (
      <div className='flex items-center justify-center h-32 text-muted-foreground'>
        No data to display
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div style={{ width: 'max-content', minWidth: '100%' }}>
      <Table style={{ width: 'max-content', minWidth: '100%' }}>
        <TableHeader className='sticky top-0 bg-background z-10'>
          <TableRow>
            <TableHead className='w-12 text-center font-mono text-xs sticky left-0 bg-background border-r px-2'>
              #
            </TableHead>
            {columns.map(column => (
              <TableHead
                key={column}
                className='min-w-[80px] whitespace-nowrap px-2'
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => {
            const globalIndex = originalRowOffset + index;
            const skipped = meta && index < meta.skippedCount;
            const isHeader = meta && index === meta.headerIndex;
            const isData = meta && index >= meta.dataStartIndex;
            const isHighlighted = highlightRange
              ? index >= highlightRange.start && index <= highlightRange.end
              : false;
            const willDrop =
              strategyPreview && strategyPreview.rowsToDrop.has(index);
            let rowClass = '';
            if (skipped) rowClass += ' opacity-40';
            if (isHeader)
              rowClass += ' bg-blue-50 dark:bg-blue-900/30 font-semibold';
            if (isData && isHighlighted)
              rowClass += ' bg-emerald-50 dark:bg-emerald-900/30';
            if (willDrop)
              rowClass +=
                ' line-through text-rose-500/80 dark:text-rose-300/70';
            return (
              <TableRow key={index} className={rowClass || undefined}>
                <TableCell className='text-center font-mono text-xs text-muted-foreground sticky left-0 bg-background border-r px-2'>
                  {globalIndex + 1}
                </TableCell>
                {columns.map((column, colIdx) => {
                  const raw = row[column];
                  const flag = cellFlags?.[index]?.[colIdx];
                  let cellClass =
                    'font-mono text-xs whitespace-nowrap text-center px-2';
                  let title: string | undefined;
                  if (flag === 'missing') {
                    cellClass +=
                      ' bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300';
                    title = 'Missing value';
                  } else if (flag === 'placeholder') {
                    cellClass +=
                      ' bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300';
                    title = 'Placeholder (potential missing)';
                  }
                  // Strategy preview: if cell missing/placeholder and strategy would replace it
                  let previewContent: React.ReactNode = raw?.toString() || '';
                  if (
                    strategyPreview &&
                    index >= (meta?.dataStartIndex ?? 0) &&
                    (flag === 'missing' || flag === 'placeholder')
                  ) {
                    const strat = strategyPreview.effective[column];
                    const stratType =
                      typeof strat === 'string' ? strat : strat?.type;
                    if (
                      stratType &&
                      ['zero', 'mean', 'median', 'mode', 'constant'].includes(
                        stratType
                      )
                    ) {
                      const repl =
                        stratType === 'zero'
                          ? 0
                          : stratType === 'constant'
                            ? strategyPreview.replacements[column]
                            : strategyPreview.replacements[column];
                      if (repl !== undefined) {
                        previewContent = (
                          <span className='flex flex-col items-center gap-0'>
                            <span className='opacity-40 line-through'>
                              {raw?.toString() ||
                                (flag === 'missing' ? '' : '')}
                            </span>
                            <span className='text-xs text-emerald-700 dark:text-emerald-300'>
                              → {repl.toString()}
                            </span>
                          </span>
                        );
                      }
                    } else if (stratType === 'drop-row') {
                      // Already indicated by row strike-through; optionally dim cell further
                      cellClass += ' opacity-60';
                    }
                  }
                  return (
                    <TableCell key={column} className={cellClass} title={title}>
                      {previewContent}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

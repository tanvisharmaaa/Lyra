'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CSVTableProps {
  data: Record<string, string | number>[];
}

export function CSVTable({ data }: CSVTableProps) {
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
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell className='text-center font-mono text-xs text-muted-foreground sticky left-0 bg-background border-r px-2'>
                {index + 1}
              </TableCell>
              {columns.map(column => (
                <TableCell
                  key={column}
                  className='font-mono text-sm whitespace-nowrap text-center px-2'
                >
                  {row[column]?.toString() || ''}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

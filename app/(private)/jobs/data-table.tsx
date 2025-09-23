'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JobStatus, WorkArrangement } from '@/lib/generated/prisma';
import { Search, Filter, Plus } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onAddJob?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onAddJob,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [workArrangementFilter, setWorkArrangementFilter] =
    React.useState<string>('all');

  // Filter data based on status and work arrangement
  const filteredData = React.useMemo(() => {
    return data.filter((job: any) => {
      const statusMatch = statusFilter === 'all' || job.status === statusFilter;
      const workArrangementMatch =
        workArrangementFilter === 'all' ||
        job.workArrangement === workArrangementFilter;
      return statusMatch && workArrangementMatch;
    });
  }, [data, statusFilter, workArrangementFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between py-4'>
        <div className='flex items-center space-x-2'>
          <div className='relative'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search jobs...'
              value={
                (table.getColumn('title')?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table.getColumn('title')?.setFilterValue(event.target.value)
              }
              className='pl-8 max-w-sm'
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-[180px]'>
              <Filter className='mr-2 h-4 w-4' />
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Statuses</SelectItem>
              <SelectItem value={JobStatus.WISHLIST}>Wishlist</SelectItem>
              <SelectItem value={JobStatus.APPLIED}>Applied</SelectItem>
              <SelectItem value={JobStatus.INTERVIEW}>Interview</SelectItem>
              <SelectItem value={JobStatus.OFFER}>Offer</SelectItem>
              <SelectItem value={JobStatus.REJECTED}>Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={workArrangementFilter}
            onValueChange={setWorkArrangementFilter}
          >
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Work Type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value={WorkArrangement.REMOTE}>Remote</SelectItem>
              <SelectItem value={WorkArrangement.ON_SITE}>On Site</SelectItem>
              <SelectItem value={WorkArrangement.HYBRID}>Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onAddJob} className='ml-4'>
          <Plus className='mr-2 h-4 w-4' />
          Add Job
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='flex-1 text-sm text-muted-foreground'>
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className='space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

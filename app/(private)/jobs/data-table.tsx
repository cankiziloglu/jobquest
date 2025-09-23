'use client';

// Force refresh - mobile compact table
import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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

  // Apply custom filters
  React.useEffect(() => {
    const filters: ColumnFiltersState = [];

    if (statusFilter !== 'all') {
      filters.push({ id: 'status', value: statusFilter });
    }

    if (workArrangementFilter !== 'all') {
      filters.push({ id: 'workArrangement', value: workArrangementFilter });
    }

    setColumnFilters(filters);
  }, [statusFilter, workArrangementFilter]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
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
      {/* Add Job Button - Top on mobile only */}
      <div className='flex justify-end items-center py-4 md:hidden'>
        <Button onClick={onAddJob}>
          <Plus className='mr-2 h-4 w-4' />
          Add Job
        </Button>
      </div>

      {/* Filters and Add Job Button - Combined row on desktop */}
      <div className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 py-4'>
        <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2'>
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
              className='pl-8 w-full sm:max-w-sm'
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-full sm:w-[140px] md:w-[160px]'>
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
            <SelectTrigger className='w-full sm:w-[140px] md:w-[160px]'>
              <Filter className='mr-2 h-4 w-4' />
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

        {/* Add Job Button - Hidden on mobile, shown on desktop */}
        <Button onClick={onAddJob} className='hidden md:flex'>
          <Plus className='mr-2 h-4 w-4' />
          Add Job
        </Button>
      </div>

      <div className='rounded-md border overflow-hidden w-full'>
        <Table className='text-xs md:text-sm w-full table-fixed'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`py-1 px-1 md:py-2 md:px-3 ${
                        (header.column.columnDef.meta as any)?.className || ''
                      }`}
                    >
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
                    <TableCell
                      key={cell.id}
                      className={`py-1 px-1 md:py-2 md:px-3 ${
                        (cell.column.columnDef.meta as any)?.className || ''
                      }`}
                    >
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
                  className='h-24 text-center py-2 px-2 md:py-3 md:px-4'
                >
                  No jobs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

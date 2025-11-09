'use client';

// Mobile compact columns
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Job, JobStatus, WorkArrangement, Note } from '@/lib/generated/prisma';
import {
  ArrowUpDown,
  MoreVertical,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
  MapPin,
} from 'lucide-react';

export type JobWithNotes = Job & { notes: Note[] };

const statusColors: Record<JobStatus, string> = {
  WISHLIST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  APPLIED:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  INTERVIEW:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  OFFER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const workArrangementColors: Record<WorkArrangement, string> = {
  REMOTE:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  ON_SITE:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  HYBRID:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

export const createColumns = (
  onView: (job: JobWithNotes) => void,
  onEdit: (job: JobWithNotes) => void,
  onDelete: (jobId: string) => void
): ColumnDef<JobWithNotes>[] => [
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex items-center cursor-pointer hover:text-foreground/80'
        >
          Job Title
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      );
    },
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className='space-y-1 min-w-0'>
          <div className='font-medium text-xs md:text-sm truncate'>
            {job.title}
          </div>
          {/* Show status and work type badges below title - ALL SCREEN SIZES */}
          <div className='flex flex-wrap gap-1'>
            <Badge
              className={`text-[10px] px-1.5 py-0.5 ${
                statusColors[job.status]
              }`}
            >
              {job.status}
            </Badge>
            {job.workArrangement && (
              <Badge
                variant='outline'
                className={`text-[10px] px-1.5 py-0.5 ${
                  workArrangementColors[job.workArrangement]
                }`}
              >
                {job.workArrangement.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
      );
    },
    meta: {
      className: 'w-[50%] md:w-auto md:min-w-[200px]',
    },
  },
  {
    accessorKey: 'company',
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='flex items-center cursor-pointer hover:text-foreground/80'
        >
          Company
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      );
    },
    cell: ({ row }) => {
      const job = row.original;
      return (
        <div className='space-y-1 min-w-0'>
          <div className='font-medium text-xs md:text-sm truncate'>
            {job.company}
          </div>
          {/* Show location below company - MOBILE ONLY */}
          {job.location && (
            <div className='text-[10px] text-muted-foreground flex items-center gap-1 md:hidden truncate'>
              <MapPin className='h-3 w-3 shrink-0' />
              {job.location}
            </div>
          )}
        </div>
      );
    },
    meta: {
      className: 'w-[35%] md:w-auto md:min-w-[150px]',
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='items-center cursor-pointer hover:text-foreground/80 hidden'
        >
          Status
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      );
    },
    cell: ({ row }) => {
      return null;
    },
    meta: {
      className: 'hidden',
    },
  },
  {
    accessorKey: 'workArrangement',
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='items-center cursor-pointer hover:text-foreground/80 hidden'
        >
          Work Type
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      );
    },
    cell: ({ row }) => {
      return null;
    },
    meta: {
      className: 'hidden',
    },
  },
  {
    accessorKey: 'location',
    header: () => <div className='text-left hidden md:block'>Location</div>,
    cell: ({ row }) => {
      const location = row.getValue('location') as string | null;
      return (
        <div className='text-xs hidden md:block truncate'>
          {location || '-'}
        </div>
      );
    },
    meta: {
      className: 'hidden md:table-cell w-24',
    },
  },
  {
    accessorKey: 'salary',
    header: () => <div className='text-left hidden md:block'>Salary</div>,
    cell: ({ row }) => {
      const salary = row.getValue('salary') as string | null;
      return (
        <div className='text-xs hidden md:block truncate'>{salary || '-'}</div>
      );
    },
    meta: {
      className: 'hidden md:table-cell w-24',
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='items-center cursor-pointer hover:text-foreground/80 hidden md:flex'
        >
          Date Applied
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return (
        <div className='text-xs hidden md:block truncate'>
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      );
    },
    meta: {
      className: 'hidden md:table-cell w-16',
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: () => <div className='w-full text-right'></div>,
    cell: ({ row }) => {
      const job = row.original;

      return (
        <div className='flex justify-end w-full'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='h-6 w-6 p-0 md:h-8 md:w-8 shrink-0'
              >
                <span className='sr-only'>Open menu</span>
                <MoreVertical className='h-3 w-3 md:h-4 md:w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onView(job)}>
                <Eye className='mr-2 h-4 w-4' />
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(job)}>
                <Edit className='mr-2 h-4 w-4' />
                Edit job
              </DropdownMenuItem>
              {job.jobUrl && (
                <DropdownMenuItem asChild>
                  <a
                    href={job.jobUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center'
                  >
                    <ExternalLink className='mr-2 h-4 w-4' />
                    View job posting
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className='text-red-600'
                onClick={() => onDelete(job.id)}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    meta: {
      className: 'w-[15%] md:w-12 text-right',
    },
  },
];

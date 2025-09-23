'use client';

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
  MoreHorizontal,
  ExternalLink,
  Eye,
  Edit,
  Trash2,
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
        <div className='space-y-1'>
          <div className='font-medium'>{job.title}</div>
          {/* Show status and work type badges below title - MOBILE ONLY */}
          <div className='flex flex-wrap gap-1 md:hidden'>
            <Badge className={statusColors[job.status]}>{job.status}</Badge>
            {job.workArrangement && (
              <Badge
                variant='outline'
                className={workArrangementColors[job.workArrangement]}
              >
                {job.workArrangement.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
      );
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
        <div className='space-y-1'>
          <div className='font-medium'>{job.company}</div>
          {/* Show location below company - MOBILE ONLY */}
          {job.location && (
            <div className='text-xs text-muted-foreground flex items-center gap-1 md:hidden'>
              📍 {job.location}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='items-center cursor-pointer hover:text-foreground/80 hidden md:flex'
        >
          Status
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as JobStatus;
      return (
        <Badge className={`${statusColors[status]} hidden md:inline-flex`}>
          {status}
        </Badge>
      );
    },
    meta: {
      className: 'hidden md:table-cell w-32',
    },
  },
  {
    accessorKey: 'workArrangement',
    header: ({ column }) => {
      return (
        <div
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className='items-center cursor-pointer hover:text-foreground/80 hidden md:flex'
        >
          Work Type
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      );
    },
    cell: ({ row }) => {
      const workArrangement = row.getValue(
        'workArrangement'
      ) as WorkArrangement | null;
      if (!workArrangement)
        return <div className='text-muted-foreground hidden md:block'>-</div>;

      return (
        <Badge
          variant='outline'
          className={`${workArrangementColors[workArrangement]} hidden md:inline-flex`}
        >
          {workArrangement.replace('_', ' ')}
        </Badge>
      );
    },
    meta: {
      className: 'hidden md:table-cell w-28',
    },
  },
  {
    accessorKey: 'location',
    header: () => <div className='text-left hidden md:block'>Location</div>,
    cell: ({ row }) => {
      const location = row.getValue('location') as string | null;
      return <div className='text-sm hidden md:block'>{location || '-'}</div>;
    },
    meta: {
      className: 'hidden md:table-cell w-36',
    },
  },
  {
    accessorKey: 'salary',
    header: () => <div className='text-left hidden md:block'>Salary</div>,
    cell: ({ row }) => {
      const salary = row.getValue('salary') as string | null;
      return <div className='text-sm hidden md:block'>{salary || '-'}</div>;
    },
    meta: {
      className: 'hidden md:table-cell w-32',
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
          Applied Date
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </div>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return (
        <div className='text-sm hidden md:block'>
          {date.toLocaleDateString()}
        </div>
      );
    },
    meta: {
      className: 'hidden md:table-cell w-32',
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const job = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
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
      );
    },
  },
];

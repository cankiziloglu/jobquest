'use client';

import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { JobWithNotes, JobCard } from './job-card';
import { JobStatus } from '@/lib/generated/prisma';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  id: JobStatus;
  title: string;
  jobs: JobWithNotes[];
  onJobClick: (job: JobWithNotes) => void;
}

const statusColors: Record<JobStatus, string> = {
  WISHLIST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  APPLIED:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  INTERVIEW:
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  OFFER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

function SortableJobCard({
  job,
  onClick,
}: {
  job: JobWithNotes;
  onClick: (job: JobWithNotes) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: job.id,
      data: {
        type: 'job',
        job: job,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='touch-manipulation'
    >
      <JobCard job={job} onClick={onClick} />
    </div>
  );
}

export function KanbanColumn({ id, title, jobs, onJobClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id, // Use the JobStatus as the droppable ID
    data: {
      type: 'column',
      status: id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-muted/30 rounded-lg p-3 h-fit min-h-[200px] md:min-h-[400px] transition-colors ${
        isOver ? 'bg-muted/60 ring-2 ring-primary/20' : ''
      }`}
    >
      {/* Column Header */}
      <div className='flex items-center justify-between mb-3 pb-2 border-b border-border'>
        <div className='flex items-center gap-2'>
          <h3 className='font-semibold text-sm'>{title}</h3>
          <Badge
            variant='secondary'
            className={`text-[10px] px-1.5 py-0.5 ${statusColors[id]}`}
          >
            {jobs.length}
          </Badge>
        </div>
      </div>

      {/* Job Cards */}
      <div className='space-y-2 flex-1'>
        {jobs.length === 0 ? (
          <div className='text-xs text-muted-foreground text-center py-8'>
            No jobs yet
          </div>
        ) : (
          jobs.map((job) => (
            <SortableJobCard key={job.id} job={job} onClick={onJobClick} />
          ))
        )}
      </div>
    </div>
  );
}

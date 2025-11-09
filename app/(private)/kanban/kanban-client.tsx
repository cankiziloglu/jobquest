'use client';

import * as React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  PointerSensor,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { JobWithNotes } from './job-card';
import { KanbanColumn } from './kanban-column';
import { JobDetailsDialog } from '../jobs/job-details-dialog';
import { JobDialog } from '../jobs/job-dialog';
import { updateJob, deleteJob } from '@/server/actions';
import { Job, JobStatus, Note } from '@/lib/generated/prisma';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface KanbanClientProps {
  initialJobs: JobWithNotes[];
}

const COLUMNS: { id: JobStatus; title: string }[] = [
  { id: JobStatus.WISHLIST, title: 'Wishlist' },
  { id: JobStatus.APPLIED, title: 'Applied' },
  { id: JobStatus.INTERVIEW, title: 'Interview' },
  { id: JobStatus.OFFER, title: 'Offer' },
  { id: JobStatus.REJECTED, title: 'Rejected' },
];

export default function KanbanClient({ initialJobs }: KanbanClientProps) {
  const [jobs, setJobs] = React.useState<JobWithNotes[]>(initialJobs);
  const [activeJob, setActiveJob] = React.useState<JobWithNotes | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [viewingJob, setViewingJob] = React.useState<JobWithNotes | null>(null);
  const [editingJob, setEditingJob] = React.useState<JobWithNotes | null>(null);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const jobsByStatus = React.useMemo(() => {
    const grouped: Record<JobStatus, JobWithNotes[]> = {
      [JobStatus.WISHLIST]: [],
      [JobStatus.APPLIED]: [],
      [JobStatus.INTERVIEW]: [],
      [JobStatus.OFFER]: [],
      [JobStatus.REJECTED]: [],
    };

    jobs.forEach((job) => {
      // Ensure the job has a valid status before grouping
      if (job.status && grouped[job.status]) {
        grouped[job.status].push(job);
      } else {
        // Fallback to WISHLIST if status is invalid
        console.warn(`Job ${job.id} has invalid status: ${job.status}, defaulting to WISHLIST`);
        grouped[JobStatus.WISHLIST].push(job);
      }
    });

    return grouped;
  }, [jobs]);

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j) => j.id === event.active.id);
    if (job) {
      setActiveJob(job);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) return;

    // Get the job ID from the dragged item
    const jobId = active.id as string;

    // Determine the new status from the drop target
    // Check if we're dropping on a column or another job card
    let newStatus: JobStatus;
    if (over.data.current?.type === 'column') {
      // Dropped directly on a column
      newStatus = over.data.current.status as JobStatus;
    } else if (over.data.current?.type === 'job') {
      // Dropped on another job card - use that job's status
      newStatus = over.data.current.job.status as JobStatus;
    } else {
      // Fallback - try to use the over.id as JobStatus
      newStatus = over.id as JobStatus;
    }

    // Check if the status actually changed
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) return;

    console.log('[handleDragEnd] Updating job', jobId, 'to status', newStatus);

    // Optimistically update the UI
    setJobs((prevJobs) =>
      prevJobs.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
    );

    // Update the job status in the database
    try {
      await updateJob(jobId, { status: newStatus });
      router.refresh();
    } catch (error) {
      console.error('Error updating job status:', error);
      // Revert the optimistic update on error
      setJobs(initialJobs);
    }
  };

  const handleViewJob = async (job: JobWithNotes) => {
    try {
      const { getJob } = await import('@/server/actions');
      const latestJob = await getJob(job.id);
      if (latestJob) {
        setViewingJob(latestJob);
      } else {
        setViewingJob(job);
      }
    } catch (error) {
      console.error('Error fetching latest job details:', error);
      setViewingJob(job);
    }
    setDetailsDialogOpen(true);
  };

  const handleAddJob = () => {
    setEditingJob(null);
    setAddDialogOpen(true);
  };

  const handleEditJob = (job: JobWithNotes) => {
    setEditingJob(job);
    setEditDialogOpen(true);
  };

  const handleJobSaved = (savedJob: Job) => {
    if (editingJob) {
      // Update existing job
      const existingJob = jobs.find((job) => job.id === savedJob.id);
      const updatedJob: JobWithNotes = {
        ...savedJob,
        notes: existingJob?.notes || [],
      };
      setJobs(jobs.map((job) => (job.id === savedJob.id ? updatedJob : job)));
    } else {
      // Add new job
      const newJob: JobWithNotes = { ...savedJob, notes: [] };
      setJobs([newJob, ...jobs]);
    }
    setEditDialogOpen(false);
    setAddDialogOpen(false);
    setEditingJob(null);
  };

  const handleNotesUpdated = (jobId: string, updatedNotes: Note[]) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, notes: updatedNotes } : job
      )
    );
    if (viewingJob?.id === jobId) {
      setViewingJob({ ...viewingJob, notes: updatedNotes });
    }
  };

  const handleDetailsDialogClose = (open: boolean) => {
    setDetailsDialogOpen(open);
    if (!open) {
      setViewingJob(null);
    }
  };

  const handleEditDialogClose = (open: boolean) => {
    setEditDialogOpen(open);
    if (!open) {
      setEditingJob(null);
    }
  };

  const handleAddDialogClose = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      setEditingJob(null);
    }
  };

  return (
    <>
      {/* Header with Add Job Button */}
      <div className='mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Kanban Board</h1>
          <p className='text-muted-foreground mt-2'>
            Drag and drop your job applications through different stages.
          </p>
        </div>
        <Button onClick={handleAddJob} className='w-full sm:w-auto'>
          <Plus className='mr-2 h-4 w-4' />
          Add Job
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className='flex flex-col md:flex-row gap-4 overflow-x-auto pb-4'>
          {COLUMNS.map((column) => (
            <div key={column.id} className='flex-1 min-w-[280px] md:min-w-[250px]'>
              <SortableContext
                items={jobsByStatus[column.id].map((job) => job.id)}
                strategy={rectSortingStrategy}
              >
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  jobs={jobsByStatus[column.id]}
                  onJobClick={handleViewJob}
                />
              </SortableContext>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeJob ? (
            <div className='opacity-50 rotate-3 cursor-grabbing'>
              <div className='bg-card border border-border rounded-lg p-3 shadow-lg'>
                <div className='font-medium text-sm'>{activeJob.title}</div>
                <div className='text-xs text-muted-foreground mt-1'>
                  {activeJob.company}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <JobDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={handleDetailsDialogClose}
        job={viewingJob}
        onNotesUpdated={handleNotesUpdated}
        onEditJob={(job) => {
          setDetailsDialogOpen(false);
          handleEditJob(job);
        }}
      />

      <JobDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogClose}
        job={editingJob}
        onJobSaved={handleJobSaved}
      />

      <JobDialog
        open={addDialogOpen}
        onOpenChange={handleAddDialogClose}
        job={null}
        onJobSaved={handleJobSaved}
      />
    </>
  );
}

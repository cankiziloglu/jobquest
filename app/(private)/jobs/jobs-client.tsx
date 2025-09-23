'use client';

import * as React from 'react';
import { createColumns, JobWithNotes } from './columns';
import { DataTable } from './data-table';
import { JobDialog } from './job-dialog';
import { JobDetailsDialog } from './job-details-dialog';
import { deleteJob } from '@/server/actions';
import { Job, Note } from '@/lib/generated/prisma';
import { useRouter } from 'next/navigation';

interface JobsPageProps {
  initialJobs: JobWithNotes[];
}

export default function JobsClient({ initialJobs }: JobsPageProps) {
  const [jobs, setJobs] = React.useState<JobWithNotes[]>(initialJobs);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [editingJob, setEditingJob] = React.useState<JobWithNotes | null>(null);
  const [viewingJob, setViewingJob] = React.useState<JobWithNotes | null>(null);
  const router = useRouter();

  const handleAddJob = () => {
    setEditingJob(null);
    setDialogOpen(true);
  };

  const handleViewJob = async (job: JobWithNotes) => {
    // Always refetch the job with latest notes when opening details
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

  const handleEditJob = (job: JobWithNotes) => {
    setEditingJob(job);
    setDialogOpen(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await deleteJob(jobId);
      setJobs(jobs.filter((job) => job.id !== jobId));
      router.refresh();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleJobSaved = (savedJob: Job) => {
    if (editingJob) {
      // Update existing job - keep existing notes
      const existingJob = jobs.find((job) => job.id === savedJob.id);
      const updatedJob: JobWithNotes = {
        ...savedJob,
        notes: existingJob?.notes || [],
      };
      setJobs(jobs.map((job) => (job.id === savedJob.id ? updatedJob : job)));
    } else {
      // Add new job with empty notes array
      const newJob: JobWithNotes = { ...savedJob, notes: [] };
      setJobs([newJob, ...jobs]);
    }
  };

  const handleNotesUpdated = (jobId: string, updatedNotes: Note[]) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId ? { ...job, notes: updatedNotes } : job
      )
    );
    // Also update the viewing job if it's the same job
    if (viewingJob?.id === jobId) {
      setViewingJob({ ...viewingJob, notes: updatedNotes });
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingJob(null);
    }
  };

  const handleDetailsDialogClose = (open: boolean) => {
    setDetailsDialogOpen(open);
    if (!open) {
      setViewingJob(null);
    }
  };

  const columns = React.useMemo(
    () => createColumns(handleViewJob, handleEditJob, handleDeleteJob),
    []
  );

  return (
    <div className='container mx-auto py-8 px-4 md:px-6 lg:px-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Job Applications</h1>
        <p className='text-muted-foreground mt-2'>
          Track and manage your job applications in one place.
        </p>
      </div>

      <DataTable columns={columns} data={jobs} onAddJob={handleAddJob} />

      <JobDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        job={editingJob}
        onJobSaved={handleJobSaved}
      />

      <JobDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={handleDetailsDialogClose}
        job={viewingJob}
        onNotesUpdated={handleNotesUpdated}
      />
    </div>
  );
}

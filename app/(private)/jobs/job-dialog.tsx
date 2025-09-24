'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Job, JobStatus, WorkArrangement, Note } from '@/lib/generated/prisma';
import { createJob, updateJob } from '@/server/actions';
import { useRouter } from 'next/navigation';
import {
  createJobSchema,
  updateJobSchema,
  CreateJobInput,
  UpdateJobInput,
} from '@/lib/schemas';

type JobWithNotes = Job & { notes: Note[] };

interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobWithNotes | null;
  onJobSaved?: (job: Job) => void;
}

export function JobDialog({
  open,
  onOpenChange,
  job,
  onJobSaved,
}: JobDialogProps) {
  const router = useRouter();
  const isEditing = Boolean(job);

  const form = useForm({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: '',
      company: '',
      description: '',
      location: '',
      salary: '',
      jobUrl: '',
      workArrangement: undefined,
      status: JobStatus.WISHLIST,
    },
  });

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  // Reset form when job changes
  React.useEffect(() => {
    if (job) {
      form.reset({
        title: job.title,
        company: job.company,
        description: job.description || '',
        location: job.location || '',
        salary: job.salary || '',
        jobUrl: job.jobUrl || '',
        workArrangement: job.workArrangement || undefined,
        status: job.status,
      });
    } else {
      form.reset({
        title: '',
        company: '',
        description: '',
        location: '',
        salary: '',
        jobUrl: '',
        workArrangement: undefined,
        status: JobStatus.WISHLIST,
      });
    }
  }, [job, form]);

  const onSubmit = async (data: any) => {
    try {
      let savedJob;
      if (job) {
        savedJob = await updateJob(job.id, data);
      } else {
        savedJob = await createJob(data);
      }

      onJobSaved?.(savedJob);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error saving job:', error);
      // You could add toast notification here
    }
  };

  const watchedWorkArrangement = watch('workArrangement');
  const watchedStatus = watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] text-sm'>
        <DialogHeader>
          <DialogTitle className='text-base'>
            {job ? 'Edit Job' : 'Add New Job'}
          </DialogTitle>
          <DialogDescription className='text-xs'>
            {job
              ? 'Update the job application details.'
              : 'Add a new job application to track.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='title' className='text-right text-xs'>
                Job Title *
              </Label>
              <div className='col-span-3'>
                <Input
                  id='title'
                  {...register('title')}
                  className='text-sm h-8'
                />
                {errors.title && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='company' className='text-right text-xs'>
                Company *
              </Label>
              <div className='col-span-3'>
                <Input
                  id='company'
                  {...register('company')}
                  className='text-sm h-8'
                />
                {errors.company && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.company.message}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='description' className='text-right text-xs'>
                Description
              </Label>
              <div className='col-span-3'>
                <Input
                  id='description'
                  {...register('description')}
                  className='text-sm h-8'
                  placeholder='Brief job description...'
                />
                {errors.description && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='location' className='text-right text-xs'>
                Location
              </Label>
              <div className='col-span-3'>
                <Input
                  id='location'
                  {...register('location')}
                  className='text-sm h-8'
                  placeholder='e.g., San Francisco, CA'
                />
                {errors.location && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.location.message}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='salary' className='text-right text-xs'>
                Salary
              </Label>
              <div className='col-span-3'>
                <Input
                  id='salary'
                  {...register('salary')}
                  className='text-sm h-8'
                  placeholder='e.g., $120k - $150k'
                />
                {errors.salary && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.salary.message}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='jobUrl' className='text-right text-xs'>
                Job URL
              </Label>
              <div className='col-span-3'>
                <Input
                  id='jobUrl'
                  {...register('jobUrl')}
                  className='text-sm h-8'
                  placeholder='https://...'
                />
                {errors.jobUrl && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.jobUrl.message}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='workArrangement' className='text-right text-xs'>
                Work Type
              </Label>
              <div className='col-span-3'>
                <Select
                  value={watchedWorkArrangement || ''}
                  onValueChange={(value) =>
                    setValue(
                      'workArrangement',
                      value ? (value as WorkArrangement) : undefined
                    )
                  }
                >
                  <SelectTrigger className='text-sm h-8'>
                    <SelectValue placeholder='Select work arrangement' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WorkArrangement.REMOTE}>
                      Remote
                    </SelectItem>
                    <SelectItem value={WorkArrangement.ON_SITE}>
                      On Site
                    </SelectItem>
                    <SelectItem value={WorkArrangement.HYBRID}>
                      Hybrid
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.workArrangement && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.workArrangement.message}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='status' className='text-right text-xs'>
                Status
              </Label>
              <div className='col-span-3'>
                <Select
                  value={watchedStatus}
                  onValueChange={(value) =>
                    setValue('status', value as JobStatus)
                  }
                >
                  <SelectTrigger className='text-sm h-8'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={JobStatus.WISHLIST}>Wishlist</SelectItem>
                    <SelectItem value={JobStatus.APPLIED}>Applied</SelectItem>
                    <SelectItem value={JobStatus.INTERVIEW}>
                      Interview
                    </SelectItem>
                    <SelectItem value={JobStatus.OFFER}>Offer</SelectItem>
                    <SelectItem value={JobStatus.REJECTED}>Rejected</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className='text-xs text-red-600 mt-1'>
                    {errors.status.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className='text-sm h-8'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting}
              className='text-sm h-8'
            >
              {isSubmitting ? 'Saving...' : job ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

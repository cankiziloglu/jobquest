'use client';

import * as React from 'react';
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
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const [formData, setFormData] = React.useState({
    title: job?.title || '',
    company: job?.company || '',
    description: job?.description || '',
    location: job?.location || '',
    salary: job?.salary || '',
    jobUrl: job?.jobUrl || '',
    workArrangement: job?.workArrangement || undefined,
    status: job?.status || JobStatus.WISHLIST,
  });

  React.useEffect(() => {
    if (job) {
      setFormData({
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
      setFormData({
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
  }, [job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        description: formData.description || undefined,
        location: formData.location || undefined,
        salary: formData.salary || undefined,
        jobUrl: formData.jobUrl || undefined,
      };

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Job' : 'Add New Job'}</DialogTitle>
          <DialogDescription>
            {job
              ? 'Update the job application details.'
              : 'Add a new job application to track.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='title' className='text-right'>
                Job Title *
              </Label>
              <Input
                id='title'
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className='col-span-3'
                required
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='company' className='text-right'>
                Company *
              </Label>
              <Input
                id='company'
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className='col-span-3'
                required
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='description' className='text-right'>
                Description
              </Label>
              <Input
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className='col-span-3'
                placeholder='Brief job description...'
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='location' className='text-right'>
                Location
              </Label>
              <Input
                id='location'
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className='col-span-3'
                placeholder='e.g., San Francisco, CA'
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='salary' className='text-right'>
                Salary
              </Label>
              <Input
                id='salary'
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
                className='col-span-3'
                placeholder='e.g., $120k - $150k'
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='jobUrl' className='text-right'>
                Job URL
              </Label>
              <Input
                id='jobUrl'
                type='url'
                value={formData.jobUrl}
                onChange={(e) =>
                  setFormData({ ...formData, jobUrl: e.target.value })
                }
                className='col-span-3'
                placeholder='https://...'
              />
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='workArrangement' className='text-right'>
                Work Type
              </Label>
              <Select
                value={formData.workArrangement || ''}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    workArrangement: value
                      ? (value as WorkArrangement)
                      : undefined,
                  })
                }
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select work arrangement' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WorkArrangement.REMOTE}>Remote</SelectItem>
                  <SelectItem value={WorkArrangement.ON_SITE}>
                    On Site
                  </SelectItem>
                  <SelectItem value={WorkArrangement.HYBRID}>Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='status' className='text-right'>
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as JobStatus })
                }
              >
                <SelectTrigger className='col-span-3'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JobStatus.WISHLIST}>Wishlist</SelectItem>
                  <SelectItem value={JobStatus.APPLIED}>Applied</SelectItem>
                  <SelectItem value={JobStatus.INTERVIEW}>Interview</SelectItem>
                  <SelectItem value={JobStatus.OFFER}>Offer</SelectItem>
                  <SelectItem value={JobStatus.REJECTED}>Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saving...' : job ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

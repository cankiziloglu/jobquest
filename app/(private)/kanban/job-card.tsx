'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Job, Note, WorkArrangement } from '@/lib/generated/prisma';
import { MapPin, Briefcase } from 'lucide-react';

export type JobWithNotes = Job & { notes: Note[] };

interface JobCardProps {
  job: JobWithNotes;
  onClick: (job: JobWithNotes) => void;
}

const workArrangementColors: Record<WorkArrangement, string> = {
  REMOTE:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  ON_SITE:
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  HYBRID:
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};

export function JobCard({ job, onClick }: JobCardProps) {
  return (
    <Card
      className='cursor-pointer hover:shadow-md transition-shadow bg-card border border-border'
      onClick={() => onClick(job)}
    >
      <CardContent className='p-3 space-y-2'>
        {/* Job Title */}
        <div className='font-medium text-sm truncate'>{job.title}</div>

        {/* Company */}
        <div className='text-xs text-muted-foreground truncate flex items-center gap-1.5'>
          <Briefcase className='h-3 w-3 shrink-0' />
          {job.company}
        </div>

        {/* Location */}
        {job.location && (
          <div className='text-xs text-muted-foreground truncate flex items-center gap-1.5'>
            <MapPin className='h-3 w-3 shrink-0' />
            {job.location}
          </div>
        )}

        {/* Work Arrangement Badge */}
        {job.workArrangement && (
          <div className='pt-1'>
            <Badge
              variant='outline'
              className={`text-[10px] px-1.5 py-0.5 ${
                workArrangementColors[job.workArrangement]
              }`}
            >
              {job.workArrangement.replace('_', ' ')}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

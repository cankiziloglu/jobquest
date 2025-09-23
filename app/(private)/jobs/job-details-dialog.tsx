'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Job, Note, JobStatus, WorkArrangement } from '@/lib/generated/prisma';
import { createNote, updateNote, deleteNote } from '@/server/actions';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
} from 'lucide-react';

interface JobDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: (Job & { notes: Note[] }) | null;
  onNotesUpdated?: (jobId: string, notes: Note[]) => void;
}

export function JobDetailsDialog({
  open,
  onOpenChange,
  job,
  onNotesUpdated,
}: JobDetailsDialogProps) {
  const [notes, setNotes] = React.useState<Note[]>(job?.notes || []);
  const [editingNote, setEditingNote] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');
  const [newNoteContent, setNewNoteContent] = React.useState('');
  const [isAddingNote, setIsAddingNote] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (job) {
      setNotes(job.notes || []);
    }
  }, [job]);

  if (!job) return null;

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

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setLoading(true);
    try {
      const newNote = await createNote(job.id, newNoteContent);
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      setNewNoteContent('');
      setIsAddingNote(false);
      onNotesUpdated?.(job.id, updatedNotes);
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editContent.trim()) return;

    setLoading(true);
    try {
      const updatedNote = await updateNote(noteId, editContent);
      const updatedNotes = notes.map((note) =>
        note.id === noteId ? updatedNote : note
      );
      setNotes(updatedNotes);
      setEditingNote(null);
      setEditContent('');
      onNotesUpdated?.(job.id, updatedNotes);
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setLoading(true);
    try {
      await deleteNote(noteId);
      const updatedNotes = notes.filter((note) => note.id !== noteId);
      setNotes(updatedNotes);
      onNotesUpdated?.(job.id, updatedNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditingNote = (note: Note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditContent('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-y-auto text-sm'>
        <DialogHeader className='space-y-3'>
          <DialogTitle className='pr-8 text-left text-base'>
            {job.title}
          </DialogTitle>
          <div className='flex items-center justify-between'>
            <DialogDescription className='m-0 text-xs'>
              {job.company}
            </DialogDescription>
            {job.jobUrl && (
              <Button
                size='sm'
                variant='outline'
                asChild
                className='text-xs h-7'
              >
                <a href={job.jobUrl} target='_blank' rel='noopener noreferrer'>
                  <ExternalLink className='h-3 w-3 mr-2' />
                  View Posting
                </a>
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Job Status and Details */}
          <div className='flex flex-wrap gap-2'>
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

          {/* Job Information */}
          <div className='grid gap-4'>
            {job.description && (
              <div>
                <Label className='text-xs font-medium'>Description</Label>
                <p className='text-xs text-muted-foreground mt-1'>
                  {job.description}
                </p>
              </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-xs'>
              {job.location && (
                <div className='flex items-center gap-2'>
                  <MapPin className='h-3 w-3 text-muted-foreground' />
                  <span>{job.location}</span>
                </div>
              )}
              {job.salary && (
                <div className='flex items-center gap-2'>
                  <DollarSign className='h-3 w-3 text-muted-foreground' />
                  <span>{job.salary}</span>
                </div>
              )}
              <div className='flex items-center gap-2'>
                <Calendar className='h-3 w-3 text-muted-foreground' />
                <span>Applied {job.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <div className='flex items-center justify-between mb-4'>
              <Label className='text-sm font-medium'>
                Notes ({notes.length})
              </Label>
              <Button
                size='sm'
                onClick={() => setIsAddingNote(true)}
                disabled={isAddingNote}
                className='text-xs h-7'
              >
                <Plus className='h-3 w-3 mr-2' />
                Add Note
              </Button>
            </div>

            {/* Add new note */}
            {isAddingNote && (
              <div className='border rounded-lg p-4 mb-4 bg-card'>
                <div className='space-y-3'>
                  <Label className='text-xs'>New Note</Label>
                  <Input
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder='Enter your note...'
                    className='text-xs h-8'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddNote();
                      }
                    }}
                  />
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      onClick={handleAddNote}
                      disabled={loading || !newNoteContent.trim()}
                      className='text-xs h-7'
                    >
                      Save
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        setIsAddingNote(false);
                        setNewNoteContent('');
                      }}
                      className='text-xs h-7'
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing notes */}
            <div className='space-y-3'>
              {notes.length === 0 ? (
                <p className='text-xs text-muted-foreground text-center py-8'>
                  No notes yet. Add your first note to track progress, thoughts,
                  or reminders about this job application.
                </p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className='border rounded-lg p-4 bg-card'>
                    {editingNote === note.id ? (
                      <div className='space-y-3'>
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className='text-xs h-8'
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleEditNote(note.id);
                            }
                          }}
                        />
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() => handleEditNote(note.id)}
                            disabled={loading}
                            className='text-xs h-7'
                          >
                            Save
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={cancelEditing}
                            className='text-xs h-7'
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className='flex justify-between items-start'>
                        <div className='flex-1'>
                          <p className='text-xs'>{note.content}</p>
                          <p className='text-[10px] text-muted-foreground mt-2'>
                            {note.createdAt.toLocaleDateString()} at{' '}
                            {note.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className='flex gap-1 ml-2'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => startEditingNote(note)}
                            disabled={loading}
                            className='h-6 w-6 p-0'
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={loading}
                            className='text-red-600 hover:text-red-800 h-6 w-6 p-0'
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

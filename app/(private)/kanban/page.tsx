import { requireUserId } from '@/lib/auth';

export default async function Kanban() {
  // Ensure user is authenticated before rendering the page
  await requireUserId();

  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-6'>Kanban Board</h1>
      <p className='text-muted-foreground'>
        Drag and drop your job applications through different stages.
      </p>
      <div className='mt-8 p-8 border rounded-lg bg-card'>
        <p className='text-center text-muted-foreground'>
          Kanban board coming soon...
        </p>
      </div>
    </div>
  );
}

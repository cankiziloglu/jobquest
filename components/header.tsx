import { Button } from '@/components/ui/button';
import { Show, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function Header() {
  return (
    <header className='flex items-center justify-between gap-4 border-b px-4 py-3 font-sans'>
      <Link href='/' className='font-bold text-lg'>
        JobQuest
      </Link>

      <Show when='signed-in'>
        <nav className='flex items-center gap-x-6'>
          <Link
            href='/dashboard'
            className='text-sm font-medium hover:text-primary'
          >
            Dashboard
          </Link>
          <Link href='/jobs' className='text-sm font-medium hover:text-primary'>
            Jobs
          </Link>
          <Link
            href='/kanban'
            className='text-sm font-medium hover:text-primary'
          >
            Kanban
          </Link>
        </nav>
      </Show>

      <div className='flex items-center gap-x-4'>
        <Show when='signed-out'>
          <SignInButton>
            <Button variant='ghost'>Sign in</Button>
          </SignInButton>
        </Show>
        <Show when='signed-in'>
          <UserButton />
        </Show>
      </div>
    </header>
  );
}

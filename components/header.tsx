import { Button } from '@/components/ui/button';
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import Link from 'next/link';

export function Header() {
  return (
    <header className='flex items-center justify-between gap-4 border-b px-4 py-3 font-sans'>
      <Link href='/' className='font-bold text-lg'>
        JobQuest
      </Link>
      <div className='flex items-center gap-x-4'>
        <SignedOut>
          <SignInButton>
            <Button variant='ghost'>Sign in</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

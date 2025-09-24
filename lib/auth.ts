import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function requireUserId() {
  const { userId } = await auth();
  if (!userId) {
    // Redirect to sign-in page if user is not authenticated
    redirect('/sign-in');
  }
  return userId;
}

// Alternative function that throws an error instead of redirecting
// Useful for API routes and server actions
export async function requireUserIdStrict() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: User must be authenticated');
  }
  return userId;
}

import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock('@clerk/nextjs/server', () => ({ auth: () => authMock() }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => redirectMock(url) }));

import { requireUserId, requireUserIdStrict } from '@/lib/auth';

describe('auth helpers', () => {
  beforeEach(() => {
    authMock.mockReset();
    redirectMock.mockClear();
  });

  it('requireUserId returns the user id when signed in', async () => {
    authMock.mockResolvedValue({ userId: 'user_123' });
    await expect(requireUserId()).resolves.toBe('user_123');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('requireUserId redirects to /sign-in when signed out', async () => {
    authMock.mockResolvedValue({ userId: null });
    await expect(requireUserId()).rejects.toThrow('NEXT_REDIRECT:/sign-in');
    expect(redirectMock).toHaveBeenCalledWith('/sign-in');
  });

  it('requireUserIdStrict returns the user id when signed in', async () => {
    authMock.mockResolvedValue({ userId: 'user_abc' });
    await expect(requireUserIdStrict()).resolves.toBe('user_abc');
  });

  it('requireUserIdStrict throws when signed out', async () => {
    authMock.mockResolvedValue({ userId: null });
    await expect(requireUserIdStrict()).rejects.toThrow(/Unauthorized/);
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

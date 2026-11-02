import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

let signedIn = false;

vi.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: ReactNode }) => (signedIn ? <>{children}</> : null),
  SignedOut: ({ children }: { children: ReactNode }) => (signedIn ? null : <>{children}</>),
  SignInButton: ({ children }: { children: ReactNode }) => <>{children}</>,
  UserButton: () => <div data-testid='user-button' />,
}));

import { Header } from '@/components/header';

describe('Header', () => {
  it('shows the sign-in button and hides nav when signed out', () => {
    signedIn = false;
    render(<Header />);
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('user-button')).not.toBeInTheDocument();
  });

  it('shows navigation and the user button when signed in', () => {
    signedIn = true;
    render(<Header />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Jobs' })).toHaveAttribute('href', '/jobs');
    expect(screen.getByRole('link', { name: 'Kanban' })).toHaveAttribute('href', '/kanban');
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
  });
});

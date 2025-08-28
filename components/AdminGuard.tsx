'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { LoadingPage } from './ui/spinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session && !session.user.isAdmin) {
      router.push('/movies');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <LoadingPage>Verifying admin access...</LoadingPage>;
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  if (!session.user.isAdmin) {
    return (
      <Alert className="max-w-md mx-auto mt-8">
        <AlertDescription>
          Access denied. You need admin privileges to view this page.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

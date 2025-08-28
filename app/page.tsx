'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '../components/ui/button';
import { LoadingPage } from '../components/ui/spinner';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/movies');
    }
  }, [session, router]);

  if (status === 'loading') {
    return <LoadingPage>Initializing app...</LoadingPage>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to MovieList</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Discover amazing movies and create your personal wishlist. 
        Keep track of movies you want to watch and never miss a great film again.
      </p>
      
      {!session ? (
        <div className="space-y-4">
          <Link href="/login">
            <Button size="lg" className="px-8 py-3">
              Get Started - Sign In with Google
            </Button>
          </Link>
          <p className="text-sm text-gray-500">
            Sign in to start building your movie wishlist
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-lg">Welcome back, {session.user.name}!</p>
          <Link href="/movies">
            <Button size="lg" className="px-8 py-3">
              Browse Movies
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
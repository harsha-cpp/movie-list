'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';

export default function Navbar() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-xl font-bold">
              MovieList
            </Link>
            <Spinner size="sm" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              MovieList
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/movies">
                  <Button variant="ghost">Movies</Button>
                </Link>
                <Link href="/wishlist">
                  <Button variant="ghost">My Wishlist</Button>
                </Link>
                {session.user.isAdmin && (
                  <>
                    <Link href="/admin/movies">
                      <Button variant="ghost">Add Movies</Button>
                    </Link>
                    <Link href="/admin/wishlists">
                      <Button variant="ghost">View Wishlists</Button>
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Hello, {session.user.name}
                  </span>
                  <Button onClick={() => signOut()} variant="outline">
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              MovieList
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
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
                  <span className="text-sm text-gray-700 hidden lg:block">
                    Hello, {session.user.name}
                  </span>
                  <Button onClick={() => signOut()} variant="outline" size="sm">
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

          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-background">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {session ? (
                <>
                  <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
                    Hello, {session.user.name}
                  </div>
                  <Link 
                    href="/movies" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    Movies
                  </Link>
                  <Link 
                    href="/wishlist" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    My Wishlist
                  </Link>
                  {session.user.isAdmin && (
                    <>
                      <Link 
                        href="/admin/movies" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        Add Movies
                      </Link>
                      <Link 
                        href="/admin/wishlists" 
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        View Wishlists
                      </Link>
                    </>
                  )}
                  <div className="pt-2 border-t border-gray-100">
                    <Button 
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }} 
                      variant="outline" 
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <Link 
                  href="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block"
                >
                  <Button className="w-full">Sign In</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

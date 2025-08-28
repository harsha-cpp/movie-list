'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Main Footer Text */}
          <div className="text-center">
                          <p className="text-gray-600 text-sm">
                Made using modern technologies ❤️
              </p>
          </div>

          {/* Tech Stack Logos */}
          <div className="flex items-center space-x-12">
            {/* Next.js */}
            <div className="flex flex-col items-center space-y-2 group cursor-pointer">
              <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
                <Image
                  src="/nextjs-icon.png"
                  alt="Next.js"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">Next.js</span>
            </div>

            {/* MongoDB */}
            <div className="flex flex-col items-center space-y-2 group cursor-pointer">
              <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
                <Image
                  src="/mongodb.svg"
                  alt="MongoDB"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">MongoDB</span>
            </div>

            {/* AWS */}
            <div className="flex flex-col items-center space-y-2 group cursor-pointer">
              <div className="relative w-10 h-10 transition-transform group-hover:scale-110">
                <Image
                  src="/Amazon_Web_Services_Logo.svg.png"
                  alt="AWS"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">AWS S3</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-4 border-t border-gray-200 w-full text-center">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} MovieList. The Movies Database.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

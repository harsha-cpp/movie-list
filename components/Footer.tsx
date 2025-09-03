'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
                          <p className="text-gray-600 text-sm">
                Made using modern technologies ❤️
              </p>
          </div>

          <div className="flex items-center space-x-6 sm:space-x-8 md:space-x-12">
            <div className="flex flex-col items-center space-y-1 sm:space-y-2 group cursor-pointer">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-110">
                <Image
                  src="/nextjs-icon.png"
                  alt="Next.js"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">Next.js</span>
            </div>

            <div className="flex flex-col items-center space-y-1 sm:space-y-2 group cursor-pointer">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-110">
                <Image
                  src="/mongodb.svg"
                  alt="MongoDB"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">MongoDB</span>
            </div>

            <div className="flex flex-col items-center space-y-1 sm:space-y-2 group cursor-pointer">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform group-hover:scale-110">
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

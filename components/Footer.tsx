import Link from 'next/link';
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-orange-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-orange-600">Sedapify</h2>
            <p className="text-gray-500 text-sm mt-1">
              Your personal AI food recipe assistant.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <Link href="/" className="text-gray-600 hover:text-orange-600 transition-colors">
              Home
            </Link>
            <Link href="/generate" className="text-gray-600 hover:text-orange-600 transition-colors">
              Generate
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-orange-600 transition-colors">
              Profile
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-100 text-center md:text-left">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Sedapify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

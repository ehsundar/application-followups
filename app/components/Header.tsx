import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full py-4 bg-white dark:bg-gray-900 shadow-sm mb-6">
      <div className="container mx-auto flex flex-col items-center justify-center">
        <Link href="/">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mb-1 cursor-pointer">
            Application Follow-ups
          </h1>
        </Link>
        <p className="text-base md:text-lg text-center text-gray-500 dark:text-gray-400 max-w-2xl">
          Effortlessly manage and follow up with your job or application recipients.
        </p>
      </div>
    </header>
  );
}

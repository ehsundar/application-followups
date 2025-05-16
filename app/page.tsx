'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

export default function Landing() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const hasAuthCookie = document.cookie.split(';').some(cookie => cookie.trim().startsWith('auth='));
      setIsLoggedIn(hasAuthCookie);
    }
    // Confirm with server
    fetch('/api/init').then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.email) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    });
  }, []);

  return (
    <main className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Application Follow-ups</h1>
      <p className="text-lg mb-8 max-w-xl text-center">
        Effortlessly manage and follow up with your job or application recipients. Upload your CSV, preview, and send personalized follow-up emails in just a few clicks.
      </p>
      <div className="flex gap-4 mb-8">
        {isLoggedIn ? (
          <Link href="/recepients">
            <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2">
              <Users size={20} />
              Go to Recipients
            </button>
          </Link>
        ) : (
          <>
            <Link href="/login">
              <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Login</button>
            </Link>
            <Link href="/signup">
              <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Sign Up</button>
            </Link>
          </>
        )}
      </div>
      <div className="text-gray-500 text-sm">Start streamlining your application follow-ups today!</div>
    </main>
  );
}

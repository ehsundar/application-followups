'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Users, LogIn } from 'lucide-react';

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
      <div className="flex gap-4 mb-8">
        {isLoggedIn ? (
          <Link href="/recepients">
            <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2">
              <Users size={20} />
              Go to Dashboard
            </button>
          </Link>
        ) : (
          <Link href="/login">
            <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2">
              <LogIn size={20} />
              Login
            </button>
          </Link>
        )}
      </div>
      <div className="text-gray-500 text-sm">Start streamlining your application follow-ups today!</div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email + '@gmail.com' }),
      });
      if (response.ok) {
        setStep(2);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send verification code');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      if (response.ok) {
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid or expired code');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Sign in to your account
          </h2>
        </div>
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="flex items-center">
                <label htmlFor="email" className="sr-only">
                  Gmail
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  className="appearance-none rounded-l relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Your Gmail username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.replace(/@.*/, ''))}
                  disabled={loading}
                  pattern="^[^@\s]+$"
                  autoComplete="username"
                />
                <span className="inline-block px-2 py-2 border-t border-b border-r border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 rounded-r text-gray-700 dark:text-gray-200 text-sm select-none">
                  @gmail.com
                </span>
              </div>
            </div>
            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm text-center">{error}</div>
            )}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send verification code'}
              </button>
            </div>
          </form>
        )}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleCodeSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="code" className="sr-only">
                  Verification Code
                </label>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 dark:text-red-400 text-sm text-center">{error}</div>
            )}
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReCaptcha } from 'next-recaptcha-v3';
import { Suspense } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [codeDigits, setCodeDigits] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs: React.RefObject<HTMLInputElement | null>[] = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const { executeRecaptcha } = useReCaptcha();

  // Determine safe next path
  const nextParam = searchParams?.get('next');
  const safeNext = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') && !nextParam.startsWith('/\\') ? nextParam : '/recepients';

  useEffect(() => {
    // On mount, check if user is already logged in
    fetch('/api/init').then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.email) {
          router.replace(safeNext);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await executeRecaptcha('login_submit');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email + '@gmail.com', recaptchaToken: token }),
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

  const handleCodeChange = (idx: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newDigits = [...codeDigits];
    newDigits[idx] = value;
    setCodeDigits(newDigits);
    if (value && idx < 5) {
      inputRefs[idx + 1].current?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text');
    if (/^\d{6}$/.test(paste)) {
      setCodeDigits(paste.split(''));
      inputRefs[5].current?.focus();
      e.preventDefault();
    }
  };

  const handleCodeKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeDigits[idx] && idx > 0) {
      inputRefs[idx - 1].current?.focus();
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const code = codeDigits.join('');
    if (!/^\d{6}$/.test(code)) {
      setError('Please enter the 6-digit code.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email + '@gmail.com', code }),
      });
      if (response.ok) {
        router.push(safeNext);
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
                  className="appearance-none rounded-l relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm cursor-text"
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
            <div className="rounded-md shadow-sm flex gap-2 justify-center">
              {codeDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{1}"
                  maxLength={1}
                  className="w-10 h-12 text-center text-2xl border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  value={digit}
                  onChange={e => handleCodeChange(idx, e.target.value)}
                  onPaste={handleCodePaste}
                  onKeyDown={e => handleCodeKeyDown(idx, e)}
                  disabled={loading}
                  autoFocus={idx === 0}
                />
              ))}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

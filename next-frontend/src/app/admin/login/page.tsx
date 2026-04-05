'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const sanitizedUsername = username.trim();
    const sanitizedPassword = password;

    if (!sanitizedUsername || !sanitizedPassword) {
      setError('Username and password cannot be empty.');
      return;
    }

    if (sanitizedPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
      setError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBase) {
        setError('API configuration missing. Please contact the administrator.');
        return;
      }
      const loginUrl = `${apiBase}/api/server/login`;
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: sanitizedUsername, password: sanitizedPassword }),
        credentials: 'include',
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      let data: any = {};

      if (contentType?.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseErr) {
          setError('Server returned invalid response. Please try again.');
          return;
        }
      } else {
        const text = await response.text();
        setError('Backend server error. Please ensure the backend is running.');
        return;
      }

      if (response.ok && data?.username) {
        sessionStorage.setItem('adminUsername', data.username);
        router.push('/admin/dashboard');
      } else {
        setError(data?.message || 'Login failed. Check your credentials.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('fetch')) {
        setError('Cannot connect to backend. Please check your environment configuration.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-4 font-['Inter']">
      <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#cf0408] mb-2">🔐 Admin Login</h2>
          <p className="text-gray-600 text-sm font-['Roboto']">Sadhana Kala Kendra Administration</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-6 text-center text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cf0408] focus:border-[#cf0408] transition duration-150 font-['Roboto']"
              placeholder="Enter username"
              autoComplete="username"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cf0408] focus:border-[#cf0408] transition duration-150 pr-12 font-['Roboto']"
              placeholder="Enter password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 top-8 flex items-center pr-3 text-gray-500 hover:text-gray-700 text-xs font-medium"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-6 rounded-lg font-bold text-lg transition duration-200 transform shadow-md ${
              loading
                ? 'bg-red-400 cursor-not-allowed text-white'
                : 'bg-[#cf0408] text-white hover:bg-red-700 hover:shadow-lg active:scale-95'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>


      </div>
    </div>
  );
}

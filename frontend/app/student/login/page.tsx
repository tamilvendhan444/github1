"use client";
import { useState } from 'react';
import { api } from '@/app/lib/api';

export default function StudentLogin() {
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ rollNo, password }) });
      localStorage.setItem('token', data.token);
      location.href = '/student/menu';
    } catch (e: any) { setError(e.message); }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Student Login</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input className="border p-2 w-full" placeholder="Roll No" value={rollNo} onChange={e=>setRollNo(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white px-4 py-2 rounded" type="submit">Login</button>
      </form>
      <p className="mt-4 text-sm">No account? <a href="/student/register" className="underline">Register</a></p>
    </div>
  );
}

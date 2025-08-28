"use client";
import { useState } from 'react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/admin/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Login failed'); return; }
    localStorage.setItem('admin_token', data.token);
    location.href = '/admin/dashboard';
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white px-4 py-2 rounded" type="submit">Login</button>
      </form>
    </div>
  );
}
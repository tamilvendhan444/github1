"use client";
import { useState } from 'react';

export default function StudentRegister() {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idCard, setIdCard] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const form = new FormData();
    form.append('name', name);
    form.append('rollNo', rollNo);
    if (email) form.append('email', email);
    form.append('password', password);
    if (idCard) form.append('idCard', idCard);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000'}/api/auth/register`, { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Registration failed'); return; }
    localStorage.setItem('token', data.token);
    location.href = '/student/menu';
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Student Registration</h1>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="border p-2 w-full" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Roll No" value={rollNo} onChange={e=>setRollNo(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Email (optional)" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="border p-2 w-full" type="file" accept="image/*" onChange={e=>setIdCard(e.target.files?.[0] || null)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white px-4 py-2 rounded" type="submit">Create account</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <a href="/student/login" className="underline">Login</a></p>
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function adminFetch(path: string, init: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = new Headers(init.headers);
  headers.set('Content-Type', headers.get('Content-Type') || 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanElId = 'qr-reader';

  async function loadOrders() {
    try { setOrders(await adminFetch('/api/admin/orders')); }
    catch (e: any) { setMessage(e.message); }
  }

  useEffect(() => { loadOrders(); }, []);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { location.href = '/admin/login'; return; }
  }, []);

  async function updateStatus(id: string, status: 'PENDING'|'PAID'|'DELIVERED') {
    try { await adminFetch(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); loadOrders(); }
    catch (e: any) { setMessage(e.message); }
  }

  async function onScanSuccess(decodedText: string) {
    try {
      setMessage('Scanning...');
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/api/qr/scan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ qrData: decodedText })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Scan failed');
      setMessage(`Scan OK. Order ${data.orderId} at ${data.scannedAt}`);
      loadOrders();
    } catch (e: any) { setMessage(e.message); }
  }

  async function startScanner() {
    if (scannerRef.current) return; // already started
    const scanner = new Html5Qrcode(scanElId);
    scannerRef.current = scanner;
    try {
      await scanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: 250 }, onScanSuccess, () => {});
    } catch (e: any) {
      setMessage(e.message);
    }
  }

  function stopScanner() {
    if (!scannerRef.current) return;
    scannerRef.current.stop().finally(()=>{ scannerRef.current?.clear(); scannerRef.current = null; });
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="space-x-2">
          <button className="border px-3 py-1" onClick={loadOrders}>Refresh</button>
          <button className="border px-3 py-1" onClick={startScanner}>Start Scanner</button>
          <button className="border px-3 py-1" onClick={stopScanner}>Stop Scanner</button>
        </div>
      </div>

      <div id={scanElId} className="w-full max-w-sm" />

      <div className="space-y-2">
        {orders.map(o=> (
          <div key={o.id} className="border rounded p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Order {o.id}</div>
                <div className="text-sm text-gray-600">Student: {o.student?.name || o.studentId}</div>
                <div className="text-sm">Total: ₹{(o.totalCents/100).toFixed(2)} | Status: {o.status}</div>
              </div>
              <div className="space-x-2">
                <button className="border px-2" onClick={()=>updateStatus(o.id, 'PAID')}>Mark Paid</button>
                <button className="border px-2" onClick={()=>updateStatus(o.id, 'DELIVERED')}>Delivered</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {message && <p className="text-blue-700 text-sm">{message}</p>}
    </div>
  );
}
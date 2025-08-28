"use client";
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/app/lib/api';

export default function MenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string>('');
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [deeplink, setDeeplink] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    api('/api/menu').then(setItems).catch((e)=>setMessage(e.message));
  }, []);

  const totalCents = useMemo(()=> items.reduce((s, it)=> s + (cart[it.id]||0) * it.priceCents, 0), [items, cart]);

  function add(id: string) { setCart(c => ({...c, [id]: (c[id]||0)+1 })); }
  function remove(id: string) { setCart(c => { const n={...c}; if(n[id]>1) n[id]-=1; else delete n[id]; return n; }); }

  async function checkout() {
    try {
      setMessage('');
      const payload = { items: Object.entries(cart).map(([id, quantity])=>({ id, quantity })) };
      const res = await api('/api/orders', { method: 'POST', body: JSON.stringify(payload) });
      setQrUrl(res.qrUrl); setDeeplink(res.upi.deeplink); setOrderId(res.order.id);
    } catch (e: any) { setMessage(e.message); }
  }

  async function markPaid() {
    if (!orderId) return;
    try { await api(`/api/orders/${orderId}/pay-success`, { method: 'POST' }); setMessage('Payment recorded. Show QR to admin for scan.'); }
    catch (e: any) { setMessage(e.message); }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Menu</h1>
      <div className="grid grid-cols-1 gap-3">
        {items.map(it=> (
          <div key={it.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-gray-600">₹{(it.priceCents/100).toFixed(2)}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>remove(it.id)} className="border px-2">-</button>
              <div>{cart[it.id]||0}</div>
              <button onClick={()=>add(it.id)} className="border px-2">+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-lg">Total: ₹{(totalCents/100).toFixed(2)}</div>
        <button disabled={!totalCents} onClick={checkout} className="bg-black text-white px-4 py-2 rounded disabled:opacity-50">Checkout</button>
      </div>

      {deeplink && (
        <div className="mt-6 space-y-2">
          <a className="underline" href={deeplink}>Open in UPI app</a>
          <button onClick={markPaid} className="block bg-green-600 text-white px-3 py-2 rounded">I have paid</button>
        </div>
      )}

      {qrUrl && (
        <div className="mt-6">
          <div className="font-medium mb-2">Receipt QR (show to admin)</div>
          <img src={qrUrl} alt="QR" className="w-48 h-48" />
        </div>
      )}

      {message && <p className="mt-4 text-sm text-blue-700">{message}</p>}
    </div>
  );
}

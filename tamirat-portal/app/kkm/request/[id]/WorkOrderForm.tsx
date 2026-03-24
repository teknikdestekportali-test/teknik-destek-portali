'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkOrderForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrderNumber.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/requests/${requestId}/work-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_order_number: workOrderNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/kkm/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24">
      <h3 className="font-semibold text-slate-800 mb-4">İş Emri Numarası Gir</h3>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          İş Emri No <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={workOrderNumber}
          onChange={(e) => setWorkOrderNumber(e.target.value)}
          required
          placeholder="ör: WO-2024-0123"
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      <button
        type="submit"
        disabled={loading || !workOrderNumber.trim()}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
      >
        {loading ? 'İşleniyor...' : 'Onayla ve Faturalama Ekibine Bildir →'}
      </button>
      <p className="text-xs text-slate-400 mt-3 text-center">
        Onaylandığında faturalama ekibine otomatik mail gidecektir.
      </p>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Action = 'rejected' | 'info_requested' | 'quoted';

interface Props {
  requestId: string;
  priority: 'routine' | 'aog';
}

const HOURLY_RATE = 250;
const HANDLING_FEE = 500;

export default function EvaluationForm({ requestId, priority }: Props) {
  const router = useRouter();
  const [action, setAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [rejection_reason, setRejectionReason] = useState('Atölye yoğunluğu sebebiyle hizmet talebiniz şu an karşılanamamaktadır. Anlayışınız için teşekkür ederiz.');
  const [info_request_text, setInfoRequestText] = useState('');
  const [man_hours, setManHours] = useState('');
  const [tat_days, setTatDays] = useState('');

  const isAOG = priority === 'aog';
  const estimatedPrice = man_hours
    ? Math.round(((Number(man_hours) * HOURLY_RATE) + HANDLING_FEE) * (isAOG ? 1.5 : 1))
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action) return;
    setLoading(true);
    setError('');
    try {
      const body: Record<string, unknown> = { action };
      if (action === 'rejected') body.rejection_reason = rejection_reason;
      if (action === 'info_requested') body.info_request_text = info_request_text;
      if (action === 'quoted') { body.man_hours = Number(man_hours); body.tat_days = Number(tat_days); }

      const res = await fetch(`/api/requests/${requestId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.refresh();
      router.push('/workshop/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-24">
      <div className="px-5 py-4 bg-slate-900 text-white">
        <h3 className="font-semibold text-sm">Talebi Değerlendir</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-5">
        {/* Action selector */}
        <div className="space-y-2 mb-5">
          {([
            { key: 'quoted', label: 'Değerlendirmeyi Paylaş', color: 'border-slate-900 bg-slate-900 text-white', inactive: 'border-slate-200 text-slate-600 hover:border-slate-400' },
            { key: 'info_requested', label: 'Ek Bilgi İste', color: 'border-amber-500 bg-amber-50 text-amber-800', inactive: 'border-slate-200 text-slate-600 hover:border-slate-400' },
            { key: 'rejected', label: 'Reddet', color: 'border-slate-300 bg-white text-red-600', inactive: 'border-slate-200 text-slate-600 hover:border-slate-400' },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAction(opt.key)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${action === opt.key ? opt.color : opt.inactive + ' text-slate-600'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Conditional fields */}
        {action === 'rejected' && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Red Gerekçesi</label>
            <textarea
              value={rejection_reason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
          </div>
        )}

        {action === 'info_requested' && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">İstenen Bilgi / Belge <span className="text-red-500">*</span></label>
            <textarea
              value={info_request_text}
              onChange={(e) => setInfoRequestText(e.target.value)}
              rows={3}
              required
              placeholder="Hangi bilgi veya belgeye ihtiyaç duyduğunuzu açıklayınız..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
        )}

        {action === 'quoted' && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Adam-Saat <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={man_hours}
                onChange={(e) => setManHours(e.target.value)}
                required
                placeholder="ör: 8"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">TAT (iş günü) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                value={tat_days}
                onChange={(e) => setTatDays(e.target.value)}
                required
                placeholder="ör: 3"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

          </div>
        )}

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        {action && (
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded-xl text-sm transition-colors disabled:opacity-50 ${
              action === 'quoted' ? 'bg-slate-900 hover:bg-slate-700 text-white'
              : action === 'info_requested' ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-white border border-slate-300 text-red-600 hover:bg-red-50 hover:border-red-300'
            }`}
          >
            {loading ? 'İşleniyor...' : 'Onayla ve Mail Gönder →'}
          </button>
        )}
      </form>
    </div>
  );
}

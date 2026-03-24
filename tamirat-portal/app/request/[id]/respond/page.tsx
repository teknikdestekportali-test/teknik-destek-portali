'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceRequest } from '@/types';

export default function CustomerRespondPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/requests/${id}`)
      .then((r) => r.json())
      .then((d) => { setRequest(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/requests/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response_text: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/request/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!request) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">Talep bulunamadı.</p>
    </div>
  );

  const evaluation = Array.isArray(request.evaluation) ? request.evaluation[0] : request.evaluation;

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white">
        <div className="max-w-2xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-lg">✈</div>
            <div>
              <h1 className="font-bold">Tamirat Talep Portalı</h1>
              <p className="text-slate-400 text-xs">Ek Bilgi Yanıtı</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 bg-orange-50">
            <p className="text-xs text-slate-500 mb-1">Referans: <strong className="text-slate-700">{request.ref_number}</strong></p>
            <h2 className="font-bold text-slate-900">Atölye Ek Bilgi Talep Etti</h2>
          </div>

          {evaluation?.info_request_text && (
            <div className="px-8 py-5 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-700 mb-2">İstenen Bilgi / Belge:</p>
              <p className="text-sm text-slate-600 bg-orange-50 border border-orange-100 rounded-lg p-4">
                {evaluation.info_request_text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 py-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Yanıtınız <span className="text-red-500">*</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              required
              placeholder="Eksik bilgi veya belge hakkında yanıtınızı yazınız..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
            />

            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
              >
                {submitting ? 'Gönderiliyor...' : 'Yanıtı Gönder →'}
              </button>
              <a
                href={`/request/${id}`}
                className="px-6 py-3 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Geri
              </a>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

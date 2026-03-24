'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ServiceRequest, STATUS_LABELS, STATUS_COLORS } from '@/types';

export default function CustomerRequestStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = searchParams.get('action');

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [done, setDone] = useState<'accepted' | 'rejected' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/requests/${id}`)
      .then((r) => r.json())
      .then((d) => { setRequest(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (action && request?.status === 'quoted') {
      handleAction(action as 'accept' | 'reject');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, request]);

  const handleAction = async (act: 'accept' | 'reject') => {
    setActionLoading(true);
    setError('');
    try {
      const endpoint = act === 'accept' ? `/api/requests/${id}/accept` : `/api/requests/${id}/reject-quote`;
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(act === 'accept' ? 'accepted' : 'rejected');
      router.replace(`/request/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!request) return <ErrorScreen message="Talep bulunamadı." />;

  const evaluation = Array.isArray(request.evaluation) ? request.evaluation[0] : request.evaluation;

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-lg">✈</div>
            <div>
              <h1 className="font-bold">Tamirat Talep Portalı</h1>
              <p className="text-slate-400 text-xs">Talep Durumu</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {done && (
          <div className={`mb-6 p-4 rounded-xl border ${done === 'accepted' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            {done === 'accepted'
              ? '✓ Teklif kabul edildi. Atölye ve KKM ekibi bilgilendirildi. İş emri süreci başlatılıyor.'
              : 'Teklif reddedildi. Talebiniz kapatılmıştır.'}
          </div>
        )}
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-5">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Referans No</p>
              <p className="text-xl font-bold text-blue-600">{request.ref_number}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_COLORS[request.status]}`}>
              {STATUS_LABELS[request.status]}
            </span>
          </div>
          <div className="px-8 py-6">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div><dt className="text-slate-500 mb-0.5">Firma</dt><dd className="font-medium">{request.customer_company}</dd></div>
              <div><dt className="text-slate-500 mb-0.5">Talep Eden</dt><dd className="font-medium">{request.customer_name}</dd></div>
              <div><dt className="text-slate-500 mb-0.5">Hizmet Türü</dt><dd className="font-medium">{request.service_type}</dd></div>
              <div>
                <dt className="text-slate-500 mb-0.5">Öncelik</dt>
                <dd>
                  {request.priority === 'aog'
                    ? <span className="inline-flex items-center gap-1 text-red-700 font-semibold"><span className="w-2 h-2 bg-red-500 rounded-full inline-block" /> AOG</span>
                    : <span className="inline-flex items-center gap-1 text-blue-700 font-medium"><span className="w-2 h-2 bg-blue-400 rounded-full inline-block" /> Rutin</span>
                  }
                </dd>
              </div>
              <div className="col-span-2"><dt className="text-slate-500 mb-0.5">Açıklama</dt><dd className="font-medium">{request.description}</dd></div>
            </dl>
          </div>
        </div>

        {/* Stepper */}
        <StatusStepper status={request.status} />

        {/* Info requested */}
        {request.status === 'info_requested' && evaluation?.info_request_text && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mt-5">
            <h3 className="font-semibold text-orange-800 mb-2">Atölye Ek Bilgi Talep Ediyor</h3>
            <p className="text-sm text-orange-700 mb-4">{evaluation.info_request_text}</p>
            <a href={`/request/${id}/respond`} className="inline-block bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-colors">
              Yanıt Ver →
            </a>
          </div>
        )}

        {/* Quote */}
        {(request.status === 'quoted' || request.status === 'accepted' || request.status === 'work_order') && evaluation && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mt-5">
            <div className="px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold">Fiyat Teklifi</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <dt className="text-slate-500 mb-0.5">Adam-Saat</dt>
                  <dd className="font-semibold">{evaluation.man_hours} saat</dd>
                </div>
                <div>
                  <dt className="text-slate-500 mb-0.5">Tahmini TAT</dt>
                  <dd className="font-semibold">{evaluation.tat_days} iş günü</dd>
                </div>
                <div>
                  <dt className="text-slate-500 mb-0.5">Teklif Fiyatı</dt>
                  <dd className="text-2xl font-bold text-green-600">{evaluation.price?.toLocaleString('en-US')} USD</dd>
                </div>
              </dl>

              {request.status === 'quoted' && !done && (
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleAction('accept')}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    {actionLoading ? '...' : '✓ Teklifi Kabul Et'}
                  </button>
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    {actionLoading ? '...' : '✗ Teklifi Reddet'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rejected */}
        {request.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-5">
            <h3 className="font-semibold text-red-800 mb-1">Talep Reddedildi</h3>
            <p className="text-sm text-red-700">{evaluation?.rejection_reason ?? 'Atölye yoğunluğu sebebiyle talebiniz karşılanamamaktadır.'}</p>
          </div>
        )}

        {/* Customer responses */}
        {request.customer_responses && request.customer_responses.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-5">
            <h3 className="font-semibold text-slate-700 mb-4">Yanıt Geçmişi</h3>
            <div className="space-y-3">
              {request.customer_responses.map((r) => (
                <div key={r.id} className="bg-slate-50 rounded-lg p-4 text-sm">
                  <p className="text-slate-700">{r.response_text}</p>
                  <p className="text-slate-400 text-xs mt-2">{new Date(r.created_at).toLocaleString('tr-TR')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusStepper({ status }: { status: string }) {
  const steps = [
    { key: 'pending', label: 'Alındı' },
    { key: 'reviewing', label: 'İnceleniyor' },
    { key: 'quoted', label: 'Teklif Verildi' },
    { key: 'work_order', label: 'İş Emri' },
  ];

  const terminalSteps: Record<string, number> = {
    rejected: 1,
    info_requested: 1,
    rejected_by_customer: 2,
  };

  const activeIndex = terminalSteps[status] ?? steps.findIndex((s) => s.key === status);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      <div className="flex items-center">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                i < activeIndex ? 'bg-blue-600 border-blue-600 text-white'
                : i === activeIndex ? 'bg-white border-blue-600 text-blue-600'
                : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {i < activeIndex ? '✓' : i + 1}
              </div>
              <p className={`text-xs mt-1.5 font-medium ${i <= activeIndex ? 'text-slate-700' : 'text-slate-400'}`}>{step.label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < activeIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Yükleniyor...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 font-medium">{message}</p>
        <a href="/" className="text-blue-600 text-sm mt-3 block hover:underline">Ana Sayfaya Dön</a>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isValidSession, SESSION_COOKIE } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { ServiceRequest, STATUS_LABELS, STATUS_COLORS } from '@/types';
import EvaluationForm from './EvaluationForm';

export default async function WorkshopRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session || !isValidSession(session.value)) redirect('/workshop/login');

  const { id } = await params;

  const { data } = await supabaseAdmin
    .from('requests')
    .select('*, evaluation:evaluations(*), customer_responses(*)')
    .eq('id', id)
    .single();

  if (!data) redirect('/workshop/dashboard');

  const request = data as ServiceRequest;
  const evaluation = Array.isArray(request.evaluation) ? request.evaluation[0] : request.evaluation;
  const responses = request.customer_responses ?? [];

  const { data: docs } = await supabaseAdmin
    .from('documents')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  const canEvaluate = ['pending', 'reviewing', 'info_requested'].includes(request.status);

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <a href="/workshop/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Dashboard
          </a>
          <div className="w-px h-4 bg-slate-700" />
          <h1 className="font-bold text-sm">{request.ref_number}</h1>
          <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[request.status]}`}>
            {STATUS_LABELS[request.status]}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Request Details */}
          <div className="col-span-2 space-y-5">
            {/* Request info card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Talep Bilgileri</h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <dt className="text-slate-500 mb-0.5">Referans No</dt>
                    <dd className="font-mono font-bold text-blue-600">{request.ref_number}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-0.5">Tarih</dt>
                    <dd className="font-medium">{new Date(request.created_at).toLocaleString('tr-TR')}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-0.5">Firma</dt>
                    <dd className="font-semibold text-slate-800">{request.customer_company}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-0.5">Talep Eden</dt>
                    <dd className="font-medium">{request.customer_name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-0.5">E-posta</dt>
                    <dd className="font-medium text-blue-600">{request.customer_email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-0.5">Hizmet Türü</dt>
                    <dd className="font-semibold">{request.service_type}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-0.5">Öncelik</dt>
                    <dd>
                      {request.priority === 'aog'
                        ? <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full"><span className="w-2 h-2 bg-red-500 rounded-full" />AOG — Acil</span>
                        : <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">Rutin</span>
                      }
                    </dd>
                  </div>
                </dl>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <dt className="text-sm text-slate-500 mb-1.5">Açıklama</dt>
                  <dd className="text-sm text-slate-700 bg-slate-50 rounded-lg p-4 leading-relaxed">{request.description}</dd>
                </div>
              </div>
            </div>

            {/* Documents */}
            {docs && docs.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800">Yüklenen Belgeler</h2>
                </div>
                <div className="p-6 space-y-2">
                  {docs.map((doc: { id: string; filename: string; file_url: string; uploaded_by: string; created_at: string }) => (
                    <a
                      key={doc.id}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📄</span>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{doc.filename}</p>
                          <p className="text-xs text-slate-400">{doc.uploaded_by === 'customer' ? 'Müşteri' : 'Atölye'} • {new Date(doc.created_at).toLocaleString('tr-TR')}</p>
                        </div>
                      </div>
                      <span className="text-blue-500 text-xs font-medium">İndir →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Customer responses */}
            {responses.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800">Müşteri Yanıtları</h2>
                </div>
                <div className="p-6 space-y-3">
                  {responses.map((r) => (
                    <div key={r.id} className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-sm text-slate-700">{r.response_text}</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date(r.created_at).toLocaleString('tr-TR')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous evaluation result */}
            {evaluation && !canEvaluate && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800">Değerlendirme Sonucu</h2>
                </div>
                <div className="p-6 text-sm">
                  {evaluation.action === 'quoted' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">Adam-Saat</p>
                        <p className="text-xl font-bold text-slate-800">{evaluation.man_hours}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">TAT (gün)</p>
                        <p className="text-xl font-bold text-slate-800">{evaluation.tat_days}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-500 mb-1">Teklif</p>
                        <p className="text-xl font-bold text-green-700">{evaluation.price?.toLocaleString('tr-TR')} ₺</p>
                      </div>
                    </div>
                  )}
                  {evaluation.action === 'rejected' && (
                    <p className="text-red-700 bg-red-50 rounded-lg p-4">{evaluation.rejection_reason}</p>
                  )}
                  {evaluation.action === 'info_requested' && (
                    <p className="text-orange-700 bg-orange-50 rounded-lg p-4">{evaluation.info_request_text}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Evaluation Form */}
          <div>
            {canEvaluate ? (
              <EvaluationForm requestId={id} priority={request.priority} />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <p className="text-sm text-slate-500 text-center py-4">
                  Bu talep <strong>{STATUS_LABELS[request.status]}</strong> durumunda. Değerlendirme tamamlandı.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

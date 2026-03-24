export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isValidKKMSession, KKM_SESSION_COOKIE } from '@/lib/kkm-auth';
import { supabaseAdmin } from '@/lib/supabase';
import WorkOrderForm from './WorkOrderForm';

export default async function KKMRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = cookieStore.get(KKM_SESSION_COOKIE);
  if (!session || !isValidKKMSession(session.value)) redirect('/kkm/login');

  const { id } = await params;

  const { data } = await supabaseAdmin
    .from('requests')
    .select('*, evaluation:evaluations(*)')
    .eq('id', id)
    .single();

  if (!data) redirect('/kkm/dashboard');

  const evaluation = Array.isArray(data.evaluation) ? data.evaluation[0] : data.evaluation;

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <a href="/kkm/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">← Dashboard</a>
          <div className="w-px h-4 bg-slate-700" />
          <h1 className="font-bold text-sm">{data.ref_number} — İş Emri Girişi</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-800">Talep Bilgileri</h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <dt className="text-slate-500 mb-0.5">Referans No</dt>
                    <dd className="font-mono font-bold text-blue-600">{data.ref_number}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-0.5">Müşteri Firma</dt>
                    <dd className="font-semibold">{data.customer_company}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-0.5">Hizmet Türü</dt>
                    <dd className="font-semibold">{data.service_type}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-0.5">Öncelik</dt>
                    <dd>
                      {data.priority === 'aog'
                        ? <span className="text-red-700 font-semibold">🔴 AOG</span>
                        : <span className="text-blue-700">🔵 Rutin</span>
                      }
                    </dd>
                  </div>
                  {evaluation && (
                    <>
                      <div>
                        <dt className="text-slate-500 mb-0.5">Adam-Saat</dt>
                        <dd className="font-semibold">{evaluation.man_hours} saat</dd>
                      </div>
                      <div>
                        <dt className="text-slate-500 mb-0.5">TAT</dt>
                        <dd className="font-semibold">{evaluation.tat_days} iş günü</dd>
                      </div>
                    </>
                  )}
                </dl>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <dt className="text-sm text-slate-500 mb-1.5">Açıklama</dt>
                  <dd className="text-sm text-slate-700 bg-slate-50 rounded-lg p-4">{data.description}</dd>
                </div>
              </div>
            </div>
          </div>

          <div>
            <WorkOrderForm requestId={id} />
          </div>
        </div>
      </main>
    </div>
  );
}

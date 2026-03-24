export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isValidKKMSession, KKM_SESSION_COOKIE } from '@/lib/kkm-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { ServiceRequest, STATUS_LABELS, STATUS_COLORS } from '@/types';

export default async function KKMDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(KKM_SESSION_COOKIE);
  if (!session || !isValidKKMSession(session.value)) redirect('/kkm/login');

  const { data } = await supabaseAdmin
    .from('requests')
    .select('*')
    .in('status', ['work_order', 'invoicing'])
    .order('created_at', { ascending: false });

  const requests = (data ?? []) as ServiceRequest[];

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-lg">📋</div>
            <div>
              <h1 className="font-bold text-sm">KKM Paneli</h1>
              <p className="text-slate-400 text-xs">İş Emri Yönetimi</p>
            </div>
          </div>
          <a href="/kkm/login" className="text-xs text-slate-400 hover:text-white transition-colors">Çıkış</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
            <p className="text-2xl font-bold text-yellow-700">{requests.filter(r => r.status === 'work_order').length}</p>
            <p className="text-sm text-yellow-600 mt-0.5">İş Emri Bekleyen</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-2xl font-bold text-emerald-700">{requests.filter(r => r.status === 'invoicing').length}</p>
            <p className="text-sm text-emerald-600 mt-0.5">Faturalama Bildirimi Yapıldı</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Kabul Edilen Talepler</h2>
          </div>
          {requests.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-4xl mb-3">📭</p>
              <p>İşlem bekleyen talep bulunmuyor.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="px-6 py-3">Referans</th>
                    <th className="px-6 py-3">Firma</th>
                    <th className="px-6 py-3">Hizmet</th>
                    <th className="px-6 py-3">Öncelik</th>
                    <th className="px-6 py-3">Durum</th>
                    <th className="px-6 py-3">İş Emri No</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono font-semibold text-blue-600 text-xs">{req.ref_number}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{req.customer_company}</td>
                      <td className="px-6 py-4 text-slate-600">{req.service_type}</td>
                      <td className="px-6 py-4">
                        {req.priority === 'aog'
                          ? <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">🔴 AOG</span>
                          : <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">Rutin</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[req.status]}`}>
                          {STATUS_LABELS[req.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {(req as ServiceRequest & { work_order_number?: string }).work_order_number ?? '—'}
                      </td>
                      <td className="px-6 py-4">
                        {req.status === 'work_order' && (
                          <a href={`/kkm/request/${req.id}`} className="text-emerald-600 hover:text-emerald-800 font-medium text-xs">
                            İş Emri Gir →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

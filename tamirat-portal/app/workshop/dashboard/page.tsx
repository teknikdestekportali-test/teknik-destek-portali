export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isValidSession, SESSION_COOKIE } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { ServiceRequest, STATUS_LABELS, STATUS_COLORS } from '@/types';
import LogoutButton from './LogoutButton';
import RequestsTable from './RequestsTable';

export default async function WorkshopDashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (!session || !isValidSession(session.value)) redirect('/workshop/login');

  const { data: requests } = await supabaseAdmin
    .from('requests')
    .select('*')
    .order('created_at', { ascending: false });

  const all = (requests ?? []) as ServiceRequest[];

  const counts = {
    total: all.length,
    pending: all.filter((r) => r.status === 'pending').length,
    active: all.filter((r) => ['reviewing', 'info_requested', 'quoted'].includes(r.status)).length,
    done: all.filter((r) => ['accepted', 'work_order', 'rejected', 'rejected_by_customer'].includes(r.status)).length,
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-lg">✈</div>
            <div>
              <h1 className="font-bold text-sm">Atölye Paneli</h1>
              <p className="text-slate-400 text-xs">Tamirat Talep Portalı</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Toplam Talep', value: counts.total, color: 'bg-white border-slate-200 text-slate-700' },
            { label: 'Bekleyen', value: counts.pending, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
            { label: 'Aktif', value: counts.active, color: 'bg-blue-50 border-blue-200 text-blue-700' },
            { label: 'Tamamlanan', value: counts.done, color: 'bg-green-50 border-green-200 text-green-700' },
          ].map((stat) => (
            <div key={stat.label} className={`border rounded-xl p-5 ${stat.color}`}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm mt-0.5 opacity-75">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Tüm Talepler</h2>
            <span className="text-xs text-slate-400">{all.length} kayıt</span>
          </div>

          <RequestsTable requests={all} />
        </div>
      </main>
    </div>
  );
}

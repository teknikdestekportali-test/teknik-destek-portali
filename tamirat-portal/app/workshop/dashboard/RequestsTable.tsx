'use client';

import { useRouter } from 'next/navigation';
import { ServiceRequest, STATUS_LABELS, STATUS_COLORS } from '@/types';

export default function RequestsTable({ requests }: { requests: ServiceRequest[] }) {
  const router = useRouter();

  if (requests.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p className="text-4xl mb-3">📋</p>
        <p>Henüz talep bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <th className="px-6 py-3">Referans</th>
            <th className="px-6 py-3">Firma</th>
            <th className="px-6 py-3">Hizmet</th>
            <th className="px-6 py-3">Öncelik</th>
            <th className="px-6 py-3">Durum</th>
            <th className="px-6 py-3">Tarih</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr
              key={req.id}
              onClick={() => router.push(`/workshop/request/${req.id}`)}
              className="border-t border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 font-mono font-semibold text-blue-600 text-xs">{req.ref_number}</td>
              <td className="px-6 py-4 font-medium text-slate-800">{req.customer_company}</td>
              <td className="px-6 py-4 text-slate-600">{req.service_type}</td>
              <td className="px-6 py-4">
                {req.priority === 'aog'
                  ? <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-red-500 rounded-full" />AOG</span>
                  : <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">Rutin</span>
                }
              </td>
              <td className="px-6 py-4">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[req.status]}`}>
                  {STATUS_LABELS[req.status]}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-400 text-xs">
                {new Date(req.created_at).toLocaleDateString('tr-TR')}
              </td>
              <td className="px-6 py-4">
                <span className="inline-block bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                  İncele →
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

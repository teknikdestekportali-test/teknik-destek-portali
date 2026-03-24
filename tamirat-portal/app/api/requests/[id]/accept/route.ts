import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendQuoteAcceptedCombined } from '@/lib/email';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: requestData, error: fetchError } = await supabaseAdmin
    .from('requests')
    .select('*, evaluation:evaluations(*)')
    .eq('id', id)
    .single();

  if (fetchError || !requestData) {
    return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 });
  }

  if (requestData.status !== 'quoted') {
    return NextResponse.json({ error: 'Bu talep teklif aşamasında değil.' }, { status: 400 });
  }

  await supabaseAdmin.from('requests').update({ status: 'work_order', updated_at: new Date().toISOString() }).eq('id', id);

  const evaluation = Array.isArray(requestData.evaluation) ? requestData.evaluation[0] : requestData.evaluation;

  await sendQuoteAcceptedCombined({
    ref_number: requestData.ref_number,
    customer_company: requestData.customer_company,
    customer_name: requestData.customer_name,
    service_type: requestData.service_type,
    priority: requestData.priority,
    tat_days: evaluation?.tat_days ?? 0,
    request_id: id,
  });

  return NextResponse.json({ success: true });
}

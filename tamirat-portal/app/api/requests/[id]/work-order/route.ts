import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidKKMSession, KKM_SESSION_COOKIE } from '@/lib/kkm-auth';
import { sendBillingNotification, sendWorkshopWorkOrderNotification, sendCustomerWorkOrderOpened } from '@/lib/email';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = req.cookies.get(KKM_SESSION_COOKIE);
  if (!session || !isValidKKMSession(session.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { work_order_number } = await req.json();

  if (!work_order_number?.trim()) {
    return NextResponse.json({ error: 'İş emri numarası boş olamaz.' }, { status: 400 });
  }

  const { data: requestData, error: fetchError } = await supabaseAdmin
    .from('requests')
    .select('*, evaluation:evaluations(*)')
    .eq('id', id)
    .single();

  if (fetchError || !requestData) {
    return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 });
  }

  if (requestData.status !== 'work_order') {
    return NextResponse.json({ error: 'Bu talep iş emri aşamasında değil.' }, { status: 400 });
  }

  await supabaseAdmin
    .from('requests')
    .update({ work_order_number, status: 'invoicing', updated_at: new Date().toISOString() })
    .eq('id', id);

  const evaluation = Array.isArray(requestData.evaluation) ? requestData.evaluation[0] : requestData.evaluation;

  await Promise.allSettled([
    sendWorkshopWorkOrderNotification({
      ref_number: requestData.ref_number,
      work_order_number,
      service_type: requestData.service_type,
      request_id: id,
    }),
    sendBillingNotification({
      ref_number: requestData.ref_number,
      work_order_number,
      price: evaluation?.price ?? 0,
    }),
    sendCustomerWorkOrderOpened({
      customer_email: requestData.customer_email,
      customer_name: requestData.customer_name,
      ref_number: requestData.ref_number,
    }),
  ]);

  return NextResponse.json({ success: true });
}

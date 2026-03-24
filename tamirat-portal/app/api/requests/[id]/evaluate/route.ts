import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isValidSession, SESSION_COOKIE } from '@/lib/auth';
import { calculatePrice } from '@/lib/pricing';
import {
  sendCustomerRejected,
  sendCustomerInfoRequest,
  sendCustomerQuote,
} from '@/lib/email';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = req.cookies.get(SESSION_COOKIE);
  if (!session || !isValidSession(session.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { action, rejection_reason, info_request_text, man_hours, tat_days } = body;

  const { data: requestData, error: fetchError } = await supabaseAdmin
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !requestData) {
    return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 });
  }

  let price: number | undefined;
  let newStatus: string;

  if (action === 'rejected') {
    newStatus = 'rejected';
  } else if (action === 'info_requested') {
    newStatus = 'info_requested';
  } else if (action === 'quoted') {
    if (!man_hours || !tat_days) {
      return NextResponse.json({ error: 'Adam-saat ve TAT değerleri zorunludur.' }, { status: 400 });
    }
    price = calculatePrice(Number(man_hours), requestData.priority === 'aog');
    newStatus = 'quoted';
  } else {
    return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });
  }

  const { error: evalError } = await supabaseAdmin.from('evaluations').upsert(
    { request_id: id, action, rejection_reason, info_request_text, man_hours: man_hours ? Number(man_hours) : null, tat_days: tat_days ? Number(tat_days) : null, price },
    { onConflict: 'request_id' }
  );
  if (evalError) return NextResponse.json({ error: evalError.message }, { status: 500 });

  await supabaseAdmin.from('requests').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);

  if (action === 'rejected') {
    await sendCustomerRejected({
      customer_email: requestData.customer_email,
      customer_name: requestData.customer_name,
      ref_number: requestData.ref_number,
      rejection_reason: rejection_reason ?? 'Atölye yoğunluğu sebebiyle hizmet talebiniz şu an karşılanamamaktadır.',
    });
  } else if (action === 'info_requested') {
    await sendCustomerInfoRequest({
      customer_email: requestData.customer_email,
      customer_name: requestData.customer_name,
      ref_number: requestData.ref_number,
      info_request_text: info_request_text ?? '',
      request_id: id,
    });
  } else if (action === 'quoted') {
    await sendCustomerQuote({
      customer_email: requestData.customer_email,
      customer_name: requestData.customer_name,
      ref_number: requestData.ref_number,
      customer_company: requestData.customer_company,
      service_type: requestData.service_type,
      priority: requestData.priority,
      description: requestData.description,
      man_hours: Number(man_hours),
      tat_days: Number(tat_days),
      price: price!,
      request_id: id,
    });
  }

  return NextResponse.json({ success: true, status: newStatus, price });
}

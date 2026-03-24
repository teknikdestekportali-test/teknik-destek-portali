import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWorkshopQuoteRejected } from '@/lib/email';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: requestData, error: fetchError } = await supabaseAdmin
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !requestData) {
    return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 });
  }

  if (requestData.status !== 'quoted') {
    return NextResponse.json({ error: 'Bu talep teklif aşamasında değil.' }, { status: 400 });
  }

  await supabaseAdmin.from('requests').update({ status: 'rejected_by_customer', updated_at: new Date().toISOString() }).eq('id', id);

  await sendWorkshopQuoteRejected({
    ref_number: requestData.ref_number,
    customer_company: requestData.customer_company,
    service_type: requestData.service_type,
  });

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendWorkshopInfoResponse } from '@/lib/email';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { response_text } = await req.json();

  if (!response_text?.trim()) {
    return NextResponse.json({ error: 'Yanıt metni boş olamaz.' }, { status: 400 });
  }

  const { data: requestData, error: fetchError } = await supabaseAdmin
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !requestData) {
    return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 });
  }

  await supabaseAdmin.from('customer_responses').insert({ request_id: id, response_text });
  await supabaseAdmin.from('requests').update({ status: 'reviewing', updated_at: new Date().toISOString() }).eq('id', id);

  await sendWorkshopInfoResponse({
    ref_number: requestData.ref_number,
    customer_company: requestData.customer_company,
    customer_name: requestData.customer_name,
    response_text,
    request_id: id,
  });

  return NextResponse.json({ success: true });
}

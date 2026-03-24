import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendCustomerConfirmation, sendWorkshopNewRequest } from '@/lib/email';
import { isValidSession, SESSION_COOKIE } from '@/lib/auth';

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await supabaseAdmin
    .from('requests')
    .select('*', { count: 'exact', head: true });
  const seq = String((count ?? 0) + 1).padStart(3, '0');
  return `TAL-${year}-${seq}`;
}

export async function GET(req: NextRequest) {
  const session = req.cookies.get(SESSION_COOKIE);
  if (!session || !isValidSession(session.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('requests')
    .select('*, evaluation:evaluations(*), customer_responses(*)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customer_company, customer_name, customer_email, service_type, description, priority } = body;

  if (!customer_company || !customer_name || !customer_email || !service_type || !description || !priority) {
    return NextResponse.json({ error: 'Tüm alanları doldurunuz.' }, { status: 400 });
  }

  const ref_number = await generateRefNumber();

  const { data, error } = await supabaseAdmin
    .from('requests')
    .insert({ customer_company, customer_name, customer_email, service_type, description, priority, ref_number, status: 'pending' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await Promise.allSettled([
    sendCustomerConfirmation({ customer_email, customer_name, ref_number, customer_company, service_type, priority, description }),
    sendWorkshopNewRequest({ ref_number, customer_company, customer_name, customer_email, service_type, priority, description, request_id: data.id }),
  ]);

  return NextResponse.json(data, { status: 201 });
}

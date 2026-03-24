import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseAdmin
    .from('requests')
    .select('*, evaluation:evaluations(*), customer_responses(*)')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Talep bulunamadı.' }, { status: 404 });
  return NextResponse.json(data);
}

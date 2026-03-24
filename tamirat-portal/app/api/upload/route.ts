import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const requestId = formData.get('requestId') as string;
  const uploadedBy = (formData.get('uploadedBy') as string) || 'customer';

  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
  if (!requestId) return NextResponse.json({ error: 'Talep ID gerekli.' }, { status: 400 });

  const ext = file.name.split('.').pop();
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `${requestId}/${safeName}`;

  const bytes = await file.arrayBuffer();
  const { data, error } = await supabaseAdmin.storage
    .from('belgeler')
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabaseAdmin.storage.from('belgeler').getPublicUrl(data.path);

  await supabaseAdmin.from('documents').insert({
    request_id: requestId,
    filename: file.name,
    file_url: urlData.publicUrl,
    uploaded_by: uploadedBy,
  });

  return NextResponse.json({ url: urlData.publicUrl, filename: file.name });
}

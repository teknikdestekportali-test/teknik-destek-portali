import { Resend } from 'resend';
import { priceBreakdown } from './pricing';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 're_placeholder');
}

const FROM = process.env.FROM_EMAIL ?? 'onboarding@resend.dev';
const WORKSHOP_EMAIL = process.env.WORKSHOP_EMAIL ?? 'atolye@demo.com';
const KKM_EMAIL = process.env.KKM_EMAIL ?? 'kkm@demo.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// Tüm mailleri tek adrese yönlendir (demo/test modu)
function to(address: string): string {
  return process.env.OVERRIDE_RECIPIENT ?? address;
}

function wrap(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.1); }
    .header { background: #0f172a; color: #fff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #94a3b8; }
    .body { padding: 32px; color: #1e293b; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-aog { background: #fee2e2; color: #dc2626; }
    .badge-routine { background: #dbeafe; color: #1d4ed8; }
    .info-box { background: #f8fafc; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 16px; margin: 16px 0; }
    .price-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 16px 0; }
    .price-total { font-size: 24px; font-weight: 700; color: #16a34a; }
    .btn { display: inline-block; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 8px 8px 8px 0; }
    .btn-accept { background: #16a34a; color: #fff; }
    .btn-reject { background: #dc2626; color: #fff; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 12px; color: #94a3b8; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; vertical-align: top; }
    td:first-child { font-weight: 600; color: #64748b; width: 160px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✈ Tamirat Talep Portalı</h1>
      <p>${title}</p>
    </div>
    <div class="body">${body}</div>
    <div class="footer">Bu mail otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</div>
  </div>
</body>
</html>`;
}

function requestTable(req: {
  ref_number: string;
  customer_company: string;
  customer_name: string;
  service_type: string;
  priority: string;
  description: string;
}): string {
  const badge =
    req.priority === 'aog'
      ? '<span class="badge badge-aog">🔴 AOG</span>'
      : '<span class="badge badge-routine">🔵 Rutin</span>';
  return `<table>
    <tr><td>Referans No</td><td><strong>${req.ref_number}</strong></td></tr>
    <tr><td>Firma</td><td>${req.customer_company}</td></tr>
    <tr><td>Talep Eden</td><td>${req.customer_name}</td></tr>
    <tr><td>Hizmet Türü</td><td>${req.service_type}</td></tr>
    <tr><td>Öncelik</td><td>${badge}</td></tr>
    <tr><td>Açıklama</td><td>${req.description}</td></tr>
  </table>`;
}

export async function sendCustomerConfirmation(req: {
  customer_email: string;
  customer_name: string;
  ref_number: string;
  customer_company: string;
  service_type: string;
  priority: string;
  description: string;
}) {
  const body = `
    <p>Sayın <strong>${req.customer_name}</strong>,</p>
    <p>Hizmet talebiniz başarıyla alınmıştır. Talebiniz en kısa sürede ilgili atölye tarafından değerlendirilecek ve tarafınıza bilgi verilecektir.</p>
    <div class="info-box">${requestTable(req)}</div>
    <p>Gelişmeler hakkında bu e-posta adresine bildirim alacaksınız.</p>
  `;
  return getResend().emails.send({
    from: FROM,
    to: to(req.customer_email),
    subject: `[${req.ref_number}] Talebiniz Alındı`,
    html: wrap('Talep Onayı', body),
  });
}

export async function sendWorkshopNewRequest(req: {
  ref_number: string;
  customer_company: string;
  customer_name: string;
  customer_email: string;
  service_type: string;
  priority: string;
  description: string;
  request_id: string;
}) {
  const link = `${APP_URL}/workshop/request/${req.request_id}`;
  const body = `
    <p>Yeni bir hizmet talebi sisteme kaydedilmiştir. Lütfen değerlendirerek işleme alınıp alınmayacağına karar veriniz.</p>
    <div class="info-box">${requestTable(req)}</div>
    <p><a href="${link}" class="btn btn-accept" style="background:#3b82f6">Talebi İncele →</a></p>
  `;
  return getResend().emails.send({
    from: FROM,
    to: to(WORKSHOP_EMAIL),
    subject: `[${req.ref_number}] Yeni Hizmet Talebi — ${req.customer_company} / ${req.service_type}`,
    html: wrap('Yeni Talep Bildirimi', body),
  });
}

export async function sendCustomerRejected(req: {
  customer_email: string;
  customer_name: string;
  ref_number: string;
  rejection_reason: string;
}) {
  const body = `
    <p>Sayın <strong>${req.customer_name}</strong>,</p>
    <p>Talebiniz incelenmiş olup mevcut atölye kapasitesi nedeniyle şu an karşılanamamaktadır.</p>
    <div class="info-box">
      <strong>Referans:</strong> ${req.ref_number}<br/>
      <strong>Açıklama:</strong> ${req.rejection_reason}
    </div>
    <p>Anlayışınız için teşekkür ederiz. İlerleyen dönemlerde yeniden başvurabilirsiniz.</p>
  `;
  return getResend().emails.send({
    from: FROM,
    to: to(req.customer_email),
    subject: `[${req.ref_number}] Talep Sonucu Hakkında`,
    html: wrap('Talep Güncelleme', body),
  });
}

export async function sendCustomerInfoRequest(req: {
  customer_email: string;
  customer_name: string;
  ref_number: string;
  info_request_text: string;
  request_id: string;
}) {
  const link = `${APP_URL}/request/${req.request_id}/respond`;
  const body = `
    <p>Sayın <strong>${req.customer_name}</strong>,</p>
    <p>Talebinizin değerlendirilebilmesi için atölyemiz aşağıdaki ek bilgi veya belgelere ihtiyaç duymaktadır.</p>
    <div class="info-box">
      <strong>Referans:</strong> ${req.ref_number}<br/><br/>
      <strong>İstenen Bilgi/Belge:</strong><br/>
      ${req.info_request_text}
    </div>
    <p>Aşağıdaki bağlantıya tıklayarak yanıtınızı iletebilirsiniz:</p>
    <p><a href="${link}" class="btn btn-accept">Yanıt Ver →</a></p>
  `;
  return getResend().emails.send({
    from: FROM,
    to: to(req.customer_email),
    subject: `[${req.ref_number}] Ek Bilgi/Belge Talebi`,
    html: wrap('Ek Bilgi Gerekli', body),
  });
}

export async function sendCustomerQuote(req: {
  customer_email: string;
  customer_name: string;
  ref_number: string;
  customer_company: string;
  service_type: string;
  priority: string;
  description: string;
  man_hours: number;
  tat_days: number;
  price: number;
  request_id: string;
}) {
  const breakdown = priceBreakdown(req.man_hours, req.priority === 'aog');
  const acceptLink = `${APP_URL}/request/${req.request_id}?action=accept`;
  const rejectLink = `${APP_URL}/request/${req.request_id}?action=reject`;

  const body = `
    <p>Sayın <strong>${req.customer_name}</strong>,</p>
    <p><strong>${req.ref_number}</strong> referanslı hizmet talebiniz için fiyat teklifimiz hazırlanmıştır.</p>
    <div class="info-box">${requestTable(req)}</div>
    <div class="price-box">
      <p style="margin:0 0 12px;font-weight:600;color:#15803d">Fiyat Teklifi</p>
      <table>
        <tr><td style="color:#64748b;width:200px">İşçilik (${req.man_hours} s × ${breakdown.hourlyRate}₺)</td><td>${breakdown.base.toLocaleString('tr-TR')} ₺</td></tr>
        <tr><td style="color:#64748b">İlgilenme Bedeli</td><td>${breakdown.handling.toLocaleString('tr-TR')} ₺</td></tr>
        ${req.priority === 'aog' ? `<tr><td style="color:#dc2626">AOG Katsayısı</td><td>× ${breakdown.multiplier}</td></tr>` : ''}
        <tr style="border-top:1px solid #86efac"><td style="font-weight:700;padding-top:8px">Toplam Teklif</td><td class="price-total">${req.price.toLocaleString('tr-TR')} ₺</td></tr>
      </table>
      <p style="margin:12px 0 0;color:#64748b;font-size:13px">Tahmini Teslim Süresi (TAT): <strong>${req.tat_days} iş günü</strong></p>
    </div>
    <p>Teklife yanıt vermek için aşağıdaki butonları kullanabilirsiniz:</p>
    <p>
      <a href="${acceptLink}" class="btn btn-accept">✓ Teklifi Kabul Et</a>
      <a href="${rejectLink}" class="btn btn-reject">✗ Teklifi Reddet</a>
    </p>
    <p style="font-size:12px;color:#94a3b8">Veya <a href="${APP_URL}/request/${req.request_id}">portal üzerinden</a> yanıt verebilirsiniz.</p>
  `;
  return getResend().emails.send({
    from: FROM,
    to: to(req.customer_email),
    subject: `[${req.ref_number}] Fiyat Teklifiniz Hazır — ${req.price.toLocaleString('tr-TR')} ₺`,
    html: wrap('Fiyat Teklifi', body),
  });
}

export async function sendWorkshopQuoteAccepted(req: {
  ref_number: string;
  customer_company: string;
  customer_name: string;
  service_type: string;
  price: number;
  request_id: string;
}) {
  const link = `${APP_URL}/workshop/request/${req.request_id}`;
  const body = `
    <p><strong>${req.customer_company}</strong> firmasının <strong>${req.ref_number}</strong> referanslı teklifi kabul edilmiştir.</p>
    <div class="info-box">
      <table>
        <tr><td>Referans No</td><td>${req.ref_number}</td></tr>
        <tr><td>Firma</td><td>${req.customer_company}</td></tr>
        <tr><td>Talep Eden</td><td>${req.customer_name}</td></tr>
        <tr><td>Hizmet</td><td>${req.service_type}</td></tr>
        <tr><td>Kabul Edilen Fiyat</td><td><strong>${req.price.toLocaleString('tr-TR')} ₺</strong></td></tr>
      </table>
    </div>
    <p><a href="${link}" class="btn btn-accept">Talebi Görüntüle →</a></p>
  `;
  return getResend().emails.send({
    from: FROM,
    to: to(WORKSHOP_EMAIL),
    subject: `[${req.ref_number}] Teklif Kabul Edildi ✓`,
    html: wrap('Teklif Kabul Bildirimi', body),
  });
}

export async function sendKKMWorkOrder(req: {
  ref_number: string;
  customer_company: string;
  service_type: string;
  customer_name: string;
  price: number;
  tat_days: number;
}) {
  const body = `
    <p>Sayın KKM,</p>
    <p>Aşağıdaki hizmet talebi için müşteri teklifi kabul etmiştir. İş emri açılması için bilgilerinize sunulur.</p>
    <div class="info-box">
      <table>
        <tr><td>Referans No</td><td><strong>${req.ref_number}</strong></td></tr>
        <tr><td>Firma</td><td>${req.customer_company}</td></tr>
        <tr><td>Talep Eden</td><td>${req.customer_name}</td></tr>
        <tr><td>Hizmet Türü</td><td>${req.service_type}</td></tr>
        <tr><td>Kabul Edilen Fiyat</td><td>${req.price.toLocaleString('tr-TR')} ₺</td></tr>
        <tr><td>Tahmini TAT</td><td>${req.tat_days} iş günü</td></tr>
      </table>
    </div>
    <p><strong>${req.ref_number}</strong> referansına istinaden iş emri açabilir misiniz?</p>
  `;
  return getResend().emails.send({
    from: FROM,
    to: to(KKM_EMAIL),
    subject: `[${req.ref_number}] İş Emri Talebi — ${req.customer_company} / ${req.service_type}`,
    html: wrap('İş Emri Açılması Talebi', body),
  });
}

export async function sendWorkshopQuoteRejected(req: {
  ref_number: string;
  customer_company: string;
  service_type: string;
}) {
  const body = `
    <p><strong>${req.customer_company}</strong> firması <strong>${req.ref_number}</strong> referanslı teklifi reddetmiştir.</p>
    <div class="info-box">
      <table>
        <tr><td>Referans No</td><td>${req.ref_number}</td></tr>
        <tr><td>Firma</td><td>${req.customer_company}</td></tr>
        <tr><td>Hizmet</td><td>${req.service_type}</td></tr>
      </table>
    </div>
    <p>Talep kapatılmıştır.</p>
  `;
  return getResend().emails.send({
    from: FROM,
    to: to(WORKSHOP_EMAIL),
    subject: `[${req.ref_number}] Teklif Reddedildi`,
    html: wrap('Teklif Red Bildirimi', body),
  });
}

export async function sendWorkshopInfoResponse(req: {
  ref_number: string;
  customer_company: string;
  customer_name: string;
  response_text: string;
  request_id: string;
}) {
  const link = `${APP_URL}/workshop/request/${req.request_id}`;
  const body = `
    <p><strong>${req.customer_company}</strong> firması eksik bilgi talebinize yanıt vermiştir.</p>
    <div class="info-box">
      <strong>Referans:</strong> ${req.ref_number}<br/>
      <strong>Yanıt Veren:</strong> ${req.customer_name}<br/><br/>
      <strong>Yanıt:</strong><br/>
      ${req.response_text}
    </div>
    <p><a href="${link}" class="btn btn-accept">Talebi İncele →</a></p>
  `;
  return getResend().emails.send({
    from: FROM,
    to: to(WORKSHOP_EMAIL),
    subject: `[${req.ref_number}] Müşteri Yanıtı Alındı`,
    html: wrap('Müşteri Yanıtı', body),
  });
}

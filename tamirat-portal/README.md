# Tamirat Talep Portalı — Demo

MRO (Maintenance, Repair & Overhaul) hizmet talep yönetim sistemi demo projesi.

## Kurulum (10 dakika)

### 1. Supabase Projesi
1. [supabase.com](https://supabase.com) üzerinde ücretsiz proje oluşturun
2. **SQL Editor** → `supabase/schema.sql` içeriğini yapıştırıp çalıştırın
3. **Settings > API** bölümünden URL ve anahtarları kopyalayın

### 2. Resend (Email)
1. [resend.com](https://resend.com) üzerinde ücretsiz hesap açın
2. API Key oluşturun
3. Test için `onboarding@resend.dev` from adresi çalışır (ek domain gerekmez)

### 3. Ortam Değişkenleri
```bash
cp .env.example .env.local
# .env.local dosyasını doldurun
```

### 4. Uygulamayı Çalıştır
```bash
npm install
npm run dev
```

`http://localhost:3000` adresinden erişin.

---

## Sayfalar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Müşteri Formu | `/` | Talep oluşturma |
| Talep Durumu | `/request/[id]` | Müşteri takip + teklif kabul/red |
| Bilgi Yanıtı | `/request/[id]/respond` | Eksik bilgi gönderimi |
| Atölye Girişi | `/workshop/login` | Login |
| Atölye Paneli | `/workshop/dashboard` | Tüm talepler |
| Talep Detay | `/workshop/request/[id]` | Değerlendirme ekranı |

## İş Akışı

```
Müşteri Form Doldurur
    ↓ Mail: Müşteri onayı + Atölye bildirimi
Atölye Değerlendirir
    ├─ Reddeder → Mail: Müşteri bilgilendirilir
    ├─ Bilgi İster → Mail: Müşteri yanıt linki alır
    │       ↓ Müşteri yanıtlar → Mail: Atölye bilgilendirilir
    └─ Teklif Verir → Mail: Fiyat + kabul/red linki
            ├─ Müşteri Reddeder → Mail: Atölye bilgilendirilir
            └─ Müşteri Kabul Eder → Mail: Atölye + KKM iş emri
```

## Fiyat Formülü

```
Teklif = ((Adam-Saat × 250₺) + 500₺) × (AOG ? 1.5 : 1.0)
```
`HOURLY_RATE` ve `HANDLING_FEE` `.env.local` üzerinden değiştirilebilir.

## Atölye Girişi (Demo)
- **Kullanıcı adı:** `atolye`  
- **Şifre:** `demo1234`  
(`.env.local` üzerinden değiştirilebilir)

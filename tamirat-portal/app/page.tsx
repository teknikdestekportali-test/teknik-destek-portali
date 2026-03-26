'use client';

import { useState, useRef } from 'react';
import { CUSTOMER_COMPANIES, SERVICE_TYPES } from '@/types';

type Step = 'form' | 'success';

export default function CustomerRequestPage() {
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    customer_company: '',
    customer_name: '',
    customer_email: '',
    service_type: '',
    description: '',
    priority: 'routine' as 'routine' | 'aog',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Bir hata oluştu.');

      // Upload files if any
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('requestId', data.id);
        fd.append('uploadedBy', 'customer');
        await fetch('/api/upload', { method: 'POST', body: fd });
      }

      setRefNumber(data.ref_number);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Talebiniz Alındı</h2>
          <p className="text-slate-500 mb-6">
            Referans numaranız e-posta adresinize gönderilmiştir. Süreç hakkında bilgilendirmeler mail yoluyla iletilecektir.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-4 mb-8">
            <p className="text-sm text-slate-500 mb-1">Referans Numaranız</p>
            <p className="text-3xl font-bold text-blue-600 tracking-wider">{refNumber}</p>
          </div>
          <button
            onClick={() => { setStep('form'); setForm({ customer_company: '', customer_name: '', customer_email: '', service_type: '', description: '', priority: 'routine' }); }}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            Yeni Talep Oluştur
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl font-bold">✈</div>
          <div>
          <h1 className="font-bold text-lg leading-tight">Teknik Destek Talep Portalı</h1>
          <p className="text-slate-400 text-xs">MRO Hizmet Talep Yönetim Sistemi</p>
          </div>
          <div className="ml-auto">
            <a href="/workshop/login" className="text-xs text-slate-400 hover:text-white transition-colors">
              Atölye Girişi →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Hizmet Talebi Oluştur</h2>
          <p className="text-slate-500 mt-1">Aşağıdaki formu eksiksiz doldurunuz. Talebiniz ilgili yetkili tarafından en kısa sürede değerlendirilecektir.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Section 1 */}
          <div className="px-8 py-6 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Talep Eden Bilgileri
            </h3>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Firma Adı <span className="text-red-500">*</span></label>
                <select
                  name="customer_company"
                  value={form.customer_company}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Firma seçiniz...</option>
                  {CUSTOMER_COMPANIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad Soyad <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    required
                    placeholder="Ahmet Yılmaz"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    name="customer_email"
                    value={form.customer_email}
                    onChange={handleChange}
                    required
                    placeholder="ahmet@firma.com"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="px-8 py-6 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Talep Detayları
            </h3>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Hizmet Türü <span className="text-red-500">*</span></label>
                <select
                  name="service_type"
                  value={form.service_type}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Hizmet türü seçiniz...</option>
                  {SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Talep Açıklaması <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Yapılmasını talep ettiğiniz işi detaylı olarak açıklayınız..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3 - Documents */}
          <div className="px-8 py-6 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Belge / Doküman <span className="text-slate-400 text-xs font-normal">(isteğe bağlı)</span>
            </h3>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              <p className="text-2xl mb-2">📎</p>
              <p className="text-sm font-medium text-slate-600">Dosya seçmek için tıklayın</p>
              <p className="text-xs text-slate-400 mt-1">PDF, Word, Excel, görsel — maks. 10MB/dosya</p>
            </div>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                    <span className="text-sm text-blue-800 truncate">📄 {f.name}</span>
                    <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 ml-2 text-xs">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4 */}
          <div className="px-8 py-6">
            <h3 className="font-semibold text-slate-700 mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              Öncelik
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.priority === 'routine' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="priority" value="routine" checked={form.priority === 'routine'} onChange={handleChange} className="mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Rutin</p>
                  <p className="text-xs text-slate-500 mt-0.5">Normal öncelikli talep</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.priority === 'aog' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="priority" value="aog" checked={form.priority === 'aog'} onChange={handleChange} className="mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 text-sm">AOG</p>
                  <p className="text-xs text-slate-500 mt-0.5">Acil talep – Fiyatlamada x 1,5 katsayı uygulanır</p>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div className="px-8 pb-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Gönderiliyor...' : 'Talebi Gönder →'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

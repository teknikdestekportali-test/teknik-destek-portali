export type RequestStatus =
  | 'pending'
  | 'reviewing'
  | 'info_requested'
  | 'rejected'
  | 'quoted'
  | 'accepted'
  | 'rejected_by_customer'
  | 'work_order'
  | 'invoicing';

export type ServiceType = 'NDT' | 'Kaplama' | 'Hangar Teçhizat' | 'Isıl İşlem-Kaynak';
export type Priority = 'routine' | 'aog';
export type CustomerCompany = 'Be Aero' | 'Mytechnic' | 'AMAC';

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Beklemede',
  reviewing: 'İnceleniyor',
  info_requested: 'Bilgi Bekleniyor',
  rejected: 'Reddedildi',
  quoted: 'Teklif Gönderildi',
  accepted: 'Kabul Edildi',
  rejected_by_customer: 'Müşteri Reddetti',
  work_order: 'İş Emri Bekleniyor',
  invoicing: 'Faturalama',
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  info_requested: 'bg-orange-100 text-orange-800',
  rejected: 'bg-red-100 text-red-800',
  quoted: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected_by_customer: 'bg-gray-100 text-gray-800',
  work_order: 'bg-emerald-100 text-emerald-800',
  invoicing: 'bg-teal-100 text-teal-800',
};

export const SERVICE_TYPES: ServiceType[] = [
  'NDT',
  'Kaplama',
  'Hangar Teçhizat',
  'Isıl İşlem-Kaynak',
];

export const CUSTOMER_COMPANIES: CustomerCompany[] = ['Be Aero', 'Mytechnic', 'AMAC'];

export interface ServiceRequest {
  id: string;
  ref_number: string;
  customer_company: string;
  customer_name: string;
  customer_email: string;
  service_type: string;
  description: string;
  priority: Priority;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  evaluation?: Evaluation | null;
  customer_responses?: CustomerInfoResponse[];
}

export interface Evaluation {
  id: string;
  request_id: string;
  action: 'rejected' | 'info_requested' | 'quoted';
  rejection_reason?: string;
  info_request_text?: string;
  man_hours?: number;
  tat_days?: number;
  price?: number;
  created_at: string;
}

export interface CustomerInfoResponse {
  id: string;
  request_id: string;
  response_text: string;
  created_at: string;
}

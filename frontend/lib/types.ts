/** User dari API auth/me dan login/register response. */
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  roles: string[];
  is_active: boolean;
}

/** Response login/register. */
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

/** Response GET /auth/me. */
export interface MeResponse {
  user: User;
}

/** Dokumen (media). */
export interface MediaItem {
  id: number;
  file_name: string;
  name: string;
  size: number;
  mime_type: string;
  collection_name: string;
  created_at: string;
}

/** Dokumen per koleksi. */
export interface Documents {
  synopsis: MediaItem[];
  manuscript: MediaItem[];
  cover_front: MediaItem[];
  cover_back: MediaItem[];
  payment_receipt: MediaItem[];
  plagiarism_check: MediaItem[];
  layout_pdf: MediaItem[];
  final_word: MediaItem[];
  perpusnas_result_pdf: MediaItem[];
  submission_receipt: MediaItem[];
}

/** Riwayat/audit trail. */
export interface HistoryItem {
  id: number;
  submission_id: number;
  actor_id: number;
  actor: {
    id: number;
    name: string;
  } | null;
  action: string;
  from_stage: string | null;
  to_stage: string | null;
  note: string | null;
  performed_at: string;
}

/** Submission (pengajuan naskah) — mapping dari SubmissionResource backend. */
export interface Submission {
  id: number;
  title: string;
  author_name: string;
  synopsis: string | null;
  category: string;
  va_number: string | null;
  current_stage: string;
  current_status: string;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  user_id?: number;
  assigned_executor_id?: number | null;

  /** Relasi (dimuat jika di-load). */
  author?: {
    id: number;
    name: string;
    email: string;
  } | null;
  executor?: {
    id: number;
    name: string;
    email: string;
  } | null;
  assigned_executor?: {
    id: number;
    name: string;
    email: string;
  } | null;

  /** Dokumen dikelompokkan per koleksi (dimuat jika di-load). */
  documents?: Documents;

  /** Riwayat perubahan status (dimuat jika di-load). */
  history?: HistoryItem[];
}

/** Pelaksana dari API admin. */
export interface Pelaksana {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

/** Response daftar submission (user). */
export interface SubmissionListResponse {
  data: Submission[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
  stats?: {
    active_count: number;
    max_active: number;
  };
}

/** Response detail submission. */
export interface SubmissionDetailResponse {
  data: Submission;
}

/** Response aksi submission (submit, approve, dll). */
export interface SubmissionActionResponse {
  message: string;
  data: Submission;
}

/** Response upload dokumen. */
export interface UploadDocumentResponse {
  message: string;
  data: Submission;
  media: {
    id: number;
    file_name: string;
    size: number;
    collection_name: string;
  };
}

/** Response daftar pelaksana (admin). */
export interface PelaksanaListResponse {
  data: Pelaksana[];
}

/** Response create pelaksana. */
export interface CreatePelaksanaResponse {
  message: string;
  data: User;
}

/** Response toggle pelaksana. */
export interface TogglePelaksanaResponse {
  message: string;
  data: {
    id: number;
    is_active: boolean;
  };
}

/** Buku untuk toko buku. */
export interface Book {
  id: number;
  slug: string;
  title: string;
  author: string;
  year: string | number | null;
  category: string;
  cover_url: string | null;
  price: number | null;
  synopsis?: string | null;
  /** null selama proses penomoran di Perpusnas; diisi admin setelah ISBN terbit. */
  isbn?: string | null;
  is_published?: boolean;
  submission_id?: number | null;
}

/** Stage workflow — konstanta dari backend Submission model. */
export const STAGES = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  ADMIN_REVIEW: 'ADMIN_REVIEW',
  NEEDS_USER_REVISION_ADMIN: 'NEEDS_USER_REVISION_ADMIN',
  ADMIN_APPROVED: 'ADMIN_APPROVED',
  ASSIGNED_TO_EXECUTOR: 'ASSIGNED_TO_EXECUTOR',
  EXECUTOR_REVIEW: 'EXECUTOR_REVIEW',
  NEEDS_USER_REVISION_EXECUTOR: 'NEEDS_USER_REVISION_EXECUTOR',
  EXECUTOR_APPROVED: 'EXECUTOR_APPROVED',
  LAYOUTING: 'LAYOUTING',
  LAYOUT_COMPLETED: 'LAYOUT_COMPLETED',
  PERPUSNAS_SUBMISSION: 'PERPUSNAS_SUBMISSION',
  WAITING_PERPUSNAS: 'WAITING_PERPUSNAS',
  PERPUSNAS_RESULT_RECEIVED: 'PERPUSNAS_RESULT_RECEIVED',
  COMPLETED: 'COMPLETED',
} as const;

/** Koleksi dokumen user. */
export const USER_COLLECTIONS = [
  'synopsis',
  'manuscript',
  'cover_front',
  'cover_back',
  'payment_receipt',
  'plagiarism_check',
] as const;

/** Koleksi dokumen hasil kerja. */
export const RESULT_COLLECTIONS = [
  'layout_pdf',
  'final_word',
  'perpusnas_result_pdf',
] as const;
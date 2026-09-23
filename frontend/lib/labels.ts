import { STAGES } from "./types";

/**
 * Mapping stage → label bahasa Indonesia untuk user.
 * Sumber kebenaran: docs/requirements.md #11 (fallback bila
 * `current_status` dari backend kosong).
 */
const STAGE_LABELS: Record<string, string> = {
  [STAGES.DRAFT]: "Draf",
  [STAGES.SUBMITTED]: "Sedang Diverifikasi",
  [STAGES.ADMIN_REVIEW]: "Sedang Diverifikasi",
  [STAGES.NEEDS_USER_REVISION_ADMIN]: "Perlu Perbaikan",
  [STAGES.NEEDS_USER_REVISION_EXECUTOR]: "Perlu Perbaikan",
  [STAGES.ADMIN_APPROVED]: "Disetujui",
  [STAGES.ASSIGNED_TO_EXECUTOR]: "Disetujui",
  [STAGES.EXECUTOR_REVIEW]: "Sedang Direview Pelaksana",
  [STAGES.EXECUTOR_APPROVED]: "Proses Layouting",
  [STAGES.LAYOUTING]: "Proses Layouting",
  [STAGES.LAYOUT_COMPLETED]: "Menunggu Pengiriman",
  [STAGES.PERPUSNAS_SUBMISSION]: "Menunggu Hasil Perpusnas",
  [STAGES.WAITING_PERPUSNAS]: "Menunggu Hasil Perpusnas",
  [STAGES.PERPUSNAS_RESULT_RECEIVED]: "Hasil Siap Diunduh",
  [STAGES.COMPLETED]: "Selesai",
};

export function stageLabel(stage: string): string {
  return STAGE_LABELS[stage] ?? stage;
}

/** Label status tampil ke user: `current_status` backend, fallback mapping stage. */
export function statusText(submission: {
  current_status?: string | null;
  current_stage: string;
}): string {
  return submission.current_status || stageLabel(submission.current_stage);
}

export type StatusTone = "neutral" | "info" | "warning" | "success";

export function statusTone(stage: string): StatusTone {
  switch (stage) {
    case STAGES.DRAFT:
      return "neutral";
    case STAGES.NEEDS_USER_REVISION_ADMIN:
    case STAGES.NEEDS_USER_REVISION_EXECUTOR:
      return "warning";
    case STAGES.PERPUSNAS_RESULT_RECEIVED:
    case STAGES.COMPLETED:
      return "success";
    default:
      return "info";
  }
}

export const STATUS_TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  info: "bg-uninus-soft text-uninus-dark",
  warning: "bg-amber-100 text-amber-900",
  success: "bg-green-100 text-green-800",
};

/** Label Indonesia untuk action audit trail (dari SubmissionService backend). */
const ACTION_LABELS: Record<string, string> = {
  DRAFT_CREATED: "Draf dibuat",
  DOCUMENT_UPLOADED: "Dokumen diunggah",
  DOCUMENT_DELETED: "Dokumen dihapus",
  SUBMITTED: "Naskah diajukan",
  ADMIN_REVIEW_STARTED: "Verifikasi admin dimulai",
  REVISION_REQUESTED: "Revisi diminta",
  APPROVED_AND_ASSIGNED: "Disetujui & ditugaskan ke pelaksana",
  EXECUTOR_REVIEW_STARTED: "Review pelaksana dimulai",
  APPROVED_BY_EXECUTOR: "Disetujui pelaksana",
  EXECUTOR_UPLOAD: "Hasil layout diunggah",
  LAYOUT_COMPLETED: "Layouting selesai",
  SUBMITTED_TO_PERPUSNAS: "Diusulkan ke Perpusnas",
  WAITING_PERPUSNAS: "Menunggu hasil Perpusnas",
  PERPUSNAS_RESULT_RECEIVED: "Hasil Perpusnas diterima",
  COMPLETED: "Selesai",
};

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

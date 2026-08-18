export const MANUSCRIPT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  SUBMITTED: "Diajukan",
  REVIEW: "Dalam Review",
  ACCEPTED: "Diterima",
  REJECTED: "Ditolak",
  IN_PRODUCTION: "Dalam Produksi",
  PUBLISHED: "Terbit",
};

export const MANUSCRIPT_NEXT_TRANSITIONS: Record<
  string,
  { to: string; label: string }[]
> = {
  SUBMITTED: [{ to: "REVIEW", label: "Mulai Review" }],
  REVIEW: [
    { to: "ACCEPTED", label: "Terima" },
    { to: "REJECTED", label: "Tolak" },
  ],
  ACCEPTED: [{ to: "IN_PRODUCTION", label: "Produksi" }],
  IN_PRODUCTION: [{ to: "PUBLISHED", label: "Terbitkan" }],
};

export const BOOK_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  SUBMITTED: "Diajukan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

export const BOOK_NEXT_TRANSITIONS: Record<
  string,
  { to: string; label: string }[]
> = {
  DRAFT: [{ to: "SUBMITTED", label: "Ajukan" }],
  SUBMITTED: [
    { to: "APPROVED", label: "Setujui" },
    { to: "REJECTED", label: "Tolak" },
  ],
  APPROVED: [{ to: "SUBMITTED", label: "Tarik" }],
  REJECTED: [{ to: "SUBMITTED", label: "Ajukan Ulang" }],
};
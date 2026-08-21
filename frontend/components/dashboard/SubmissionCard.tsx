"use client";

import { useState, type FormEvent } from "react";
import { api, ApiError, downloadFile, firstError } from "@/lib/api";
import type {
  Pelaksana,
  Submission,
  SubmissionActionResponse,
} from "@/lib/types";
import { STAGES } from "@/lib/types";

interface SubmissionCardProps {
  submission: Submission;
  token: string;
  isAdmin?: boolean;
  isOwner?: boolean;
  isAssignedPelaksana?: boolean;
  pelaksana?: Pelaksana[];
  onDone?: () => void;
}

const COLLECTION_LABELS: Record<string, string> = {
  synopsis: "Sinopsis",
  manuscript: "Naskah Word",
  cover_front: "Cover Depan",
  cover_back: "Cover Belakang",
  payment_receipt: "Kwitansi Lunas Keuangan",
  plagiarism_check: "Bukti Cek Plagiasi",
  layout_pdf: "PDF Layout",
  final_word: "Word Final",
  perpusnas_result_pdf: "PDF Hasil Perpusnas",
};

function formatDate(iso?: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSize(bytes: number | undefined): string {
  if (bytes == null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SubmissionCard({
  submission: s,
  token,
  isAdmin = false,
  isOwner = false,
  isAssignedPelaksana = false,
  pelaksana = [],
  onDone,
}: SubmissionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showNoteForm, setShowNoteForm] = useState<null | "admin" | "executor">(null);
  const [selectedExecutorId, setSelectedExecutorId] = useState<string>("");
  const [resultFile, setResultFile] = useState<File | null>(null);

  const stage = s.current_stage;

  const canExpand =
    isAdmin || isOwner || isAssignedPelaksana || s.documents || s.history;

  async function act(path: string, body?: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api<SubmissionActionResponse>(path, {
        method: "POST",
        token,
        body,
      });
      setSuccess(res.message);
      onDone?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Aksi gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUploadDocument(e: FormEvent, collection: string) {
    e.preventDefault();
    const fileInput = (e.target as HTMLFormElement).elements.namedItem(
      "file",
    ) as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("collection", collection);
    form.append("file", file);

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api<SubmissionActionResponse>(
        `/submissions/${s.id}/documents`,
        { method: "POST", token, form },
      );
      setSuccess(res.message);
      onDone?.();
    } catch (err) {
      setError(
        err instanceof ApiError ? firstError(err.errors, err.message) : "Upload gagal.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestRevision(kind: "admin" | "executor") {
    if (!note.trim()) {
      setError("Catatan revisi wajib diisi.");
      return;
    }
    const base = kind === "admin" ? "/admin" : "/executor";
    await act(`${base}/submissions/${s.id}/request-revision`, { note });
    setNote("");
    setShowNoteForm(null);
  }

  function renderUserActions() {
    // DRAFT / sedang revisi → upload dokumen dimungkinkan
    const editable =
      stage === STAGES.DRAFT ||
      stage === STAGES.NEEDS_USER_REVISION_ADMIN ||
      stage === STAGES.NEEDS_USER_REVISION_EXECUTOR;
    const canSubmit =
      stage === STAGES.DRAFT ||
      stage === STAGES.NEEDS_USER_REVISION_ADMIN ||
      stage === STAGES.NEEDS_USER_REVISION_EXECUTOR;

    if (!editable && stage !== STAGES.DRAFT) return null;

    return (
      <div className="mt-4 space-y-3">
        {stage === STAGES.DRAFT && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act(`/submissions/${s.id}/submit`)}
            className="rounded-full bg-uninus px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-uninus-dark disabled:opacity-60"
          >
            {busy ? "Memproses..." : "Ajukan Pengajuan"}
          </button>
        )}
        <details className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-gray-700">
            Unggah / Perbarui Dokumen
          </summary>
          <div className="mt-3 space-y-4">
            {Object.entries(COLLECTION_LABELS)
              .filter(([key]) => !["layout_pdf", "final_word", "perpusnas_result_pdf"].includes(key))
              .map(([key, label]) => (
                <form
                  key={key}
                  onSubmit={(e) => handleUploadDocument(e, key)}
                  className="flex flex-wrap items-end justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-500">
                      {s.documents?.[key as keyof typeof s.documents]?.length
                        ? `${s.documents[key as keyof typeof s.documents].length} versi terunggah`
                        : "Belum ada dokumen"}
                    </p>
                    <input
                      type="file"
                      name="file"
                      required
                      className="mt-2 block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-uninus-soft file:px-4 file:py-2 file:text-xs file:font-semibold file:text-uninus"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="rounded-full border border-uninus px-4 py-2 text-xs font-semibold text-uninus transition-colors hover:bg-uninus hover:text-white disabled:opacity-60"
                  >
                    Unggah
                  </button>
                </form>
              ))}
          </div>
        </details>
      </div>
    );
  }

  function renderAdminActions() {
    switch (stage) {
      case STAGES.SUBMITTED:
        return (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => act(`/admin/submissions/${s.id}/start-review`)}
              className="rounded-full bg-uninus px-4 py-2 text-sm font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
            >
              Mulai Review
            </button>
          </div>
        );
      case STAGES.ADMIN_REVIEW:
        return (
          <div className="mt-4 space-y-3">
            {!showNoteForm && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteForm("admin")}
                  className="rounded-full border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 disabled:opacity-60"
                >
                  Minta Revisi
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoteForm(null)}
                  className="rounded-full bg-uninus px-4 py-2 text-sm font-semibold text-white hover:bg-uninus-dark"
                >
                  Setujui & Tugaskan
                </button>
              </div>
            )}
            {showNoteForm === "admin" && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Catatan perbaikan untuk user..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRequestRevision("admin")}
                    className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                  >
                    Kirim Permintaan Revisi
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(null)}
                    className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
            {showNoteForm === null && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Pilih Pelaksana
                </label>
                <select
                  value={selectedExecutorId}
                  onChange={(e) => setSelectedExecutorId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
                >
                  <option value="">-- Pilih pelaksana --</option>
                  {pelaksana.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={busy || !selectedExecutorId}
                    onClick={() =>
                      act(`/admin/submissions/${s.id}/approve-assign`, {
                        executor_id: Number(selectedExecutorId),
                        note: note || undefined,
                      })
                    }
                    className="rounded-full bg-uninus px-4 py-2 text-xs font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
                  >
                    Setujui & Tugaskan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(null)}
                    className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case STAGES.LAYOUT_COMPLETED:
        return (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => act(`/admin/submissions/${s.id}/submit-to-perpusnas`)}
              className="rounded-full bg-uninus px-4 py-2 text-sm font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
            >
              Usulkan ke Perpusnas
            </button>
          </div>
        );
      case STAGES.PERPUSNAS_SUBMISSION:
        return (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                Status diubah menjadi "Menunggu Hasil Perpusnas" setelah usulan dikirimkan.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => act(`/admin/submissions/${s.id}/perpusnas-waiting`, { note })}
                  className="rounded-full bg-uninus px-4 py-2 text-xs font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
                >
                  Tandai Menunggu Hasil
                </button>
              </div>
            </div>
          </div>
        );
      case STAGES.WAITING_PERPUSNAS:
        return (
          <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">Unggah Hasil Perpusnas</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!resultFile) {
                  setError("Pilih file PDF hasil Perpusnas terlebih dahulu.");
                  return;
                }
                const form = new FormData();
                form.append("file", resultFile);
                if (note) form.append("note", note);
                setBusy(true);
                setError(null);
                setSuccess(null);
                api<SubmissionActionResponse>(
                  `/admin/submissions/${s.id}/perpusnas-result`,
                  { method: "POST", token, form },
                )
                  .then((res) => {
                    setSuccess(res.message);
                    setResultFile(null);
                    onDone?.();
                  })
                  .catch((err) =>
                    setError(
                      err instanceof ApiError ? err.message : "Gagal mengunggah hasil.",
                    ),
                  )
                  .finally(() => setBusy(false));
              }}
              className="flex flex-wrap items-center gap-3"
            >
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={(e) => setResultFile(e.target.files?.[0] ?? null)}
                className="block w-full flex-1 text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-uninus-soft file:px-4 file:py-2 file:text-xs file:font-semibold file:text-uninus"
              />
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-uninus px-4 py-2 text-xs font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
              >
                {busy ? "Mengunggah..." : "Unggah & Kirim ke User"}
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  }

  function renderExecutorActions() {
    switch (stage) {
      case STAGES.ASSIGNED_TO_EXECUTOR:
        return (
          <div className="mt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => act(`/executor/submissions/${s.id}/start-review`)}
              className="rounded-full bg-uninus px-4 py-2 text-sm font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
            >
              Mulai Review
            </button>
          </div>
        );
      case STAGES.EXECUTOR_REVIEW:
        return (
          <div className="mt-4 space-y-3">
            {!showNoteForm && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowNoteForm("executor")}
                  className="rounded-full border border-amber-500 px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50"
                >
                  Minta Revisi
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => act(`/executor/submissions/${s.id}/approve`, { note })}
                  className="rounded-full bg-uninus px-4 py-2 text-sm font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
                >
                  Setujui & Masuk Layouting
                </button>
              </div>
            )}
            {showNoteForm === "executor" && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Catatan perbaikan untuk user..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleRequestRevision("executor")}
                    className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
                  >
                    Kirim Permintaan Revisi
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(null)}
                    className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem(
                  "collection",
                ) as HTMLSelectElement | null;
                const fileInput = (e.target as HTMLFormElement).elements.namedItem(
                  "file",
                ) as HTMLInputElement | null;
                const collection = input?.value;
                const file = fileInput?.files?.[0];
                if (!collection || !file) return;
                const form = new FormData();
                form.append("collection", collection);
                form.append("file", file);
                setBusy(true);
                setError(null);
                setSuccess(null);
                api<SubmissionActionResponse>(
                  `/executor/submissions/${s.id}/upload`,
                  { method: "POST", token, form },
                )
                  .then((res) => {
                    setSuccess(res.message);
                    onDone?.();
                  })
                  .catch((err) =>
                    setError(
                      err instanceof ApiError ? err.message : "Gagal mengunggah.",
                    ),
                  )
                  .finally(() => setBusy(false));
              }}
              className="flex flex-wrap items-end gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Jenis Dokumen
                </label>
                <select
                  name="collection"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
                  defaultValue="layout_pdf"
                >
                  <option value="layout_pdf">PDF Layout</option>
                  <option value="final_word">Word Final</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  File
                </label>
                <input
                  type="file"
                  name="file"
                  required
                  className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-uninus-soft file:px-4 file:py-2 file:text-xs file:font-semibold file:text-uninus"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-uninus px-4 py-2 text-xs font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
              >
                Unggah File Hasil
              </button>
            </form>
          </div>
        );
      case STAGES.LAYOUTING:
        return (
          <div className="mt-4 space-y-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.target as HTMLFormElement).elements.namedItem(
                  "collection",
                ) as HTMLSelectElement | null;
                const fileInput = (e.target as HTMLFormElement).elements.namedItem(
                  "file",
                ) as HTMLInputElement | null;
                const collection = input?.value;
                const file = fileInput?.files?.[0];
                if (!collection || !file) return;
                const form = new FormData();
                form.append("collection", collection);
                form.append("file", file);
                setBusy(true);
                setError(null);
                setSuccess(null);
                api<SubmissionActionResponse>(
                  `/executor/submissions/${s.id}/upload`,
                  { method: "POST", token, form },
                )
                  .then((res) => {
                    setSuccess(res.message);
                    onDone?.();
                  })
                  .catch((err) =>
                    setError(
                      err instanceof ApiError ? err.message : "Gagal mengunggah.",
                    ),
                  )
                  .finally(() => setBusy(false));
              }}
              className="flex flex-wrap items-end gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Jenis Dokumen
                </label>
                <select
                  name="collection"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
                  defaultValue="layout_pdf"
                >
                  <option value="layout_pdf">PDF Layout</option>
                  <option value="final_word">Word Final</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  File
                </label>
                <input
                  type="file"
                  name="file"
                  required
                  className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-uninus-soft file:px-4 file:py-2 file:text-xs file:font-semibold file:text-uninus"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-uninus px-4 py-2 text-xs font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
              >
                Unggah File Hasil
              </button>
            </form>
            <button
              type="button"
              disabled={busy}
              onClick={() => act(`/executor/submissions/${s.id}/complete-layout`, { note })}
              className="rounded-full bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
            >
              Selesaikan Layouting (Kirim ke Admin)
            </button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold text-gray-900">{s.title}</h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {s.author_name || s.author?.name || "-"} · {s.category}
          </p>
          {s.executor && (
            <p className="mt-0.5 text-xs text-gray-400">
              Pelaksana: {s.executor.name}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-uninus-soft px-3 py-1 text-xs font-bold text-uninus">
          {s.current_status || s.current_stage}
        </span>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-3 rounded-lg bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {isOwner && renderUserActions()}
      {isAdmin && renderAdminActions()}
      {isAssignedPelaksana && renderExecutorActions()}

      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 text-xs font-semibold text-uninus hover:underline"
        >
          {expanded ? "Sembunyikan detail" : "Lihat detail"}
        </button>
      )}

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-gray-100 pt-3 text-sm text-gray-600">
          <p>
            <span className="font-semibold text-gray-700">Dibuat:</span>{" "}
            {formatDate(s.created_at)}
          </p>
          <p>
            <span className="font-semibold text-gray-700">Diajukan:</span>{" "}
            {formatDate(s.submitted_at)}
          </p>
          {s.synopsis && <p className="leading-relaxed">{s.synopsis}</p>}

          {s.documents && (
            <div className="mt-2">
              <p className="font-semibold text-gray-700">Dokumen</p>
              <ul className="mt-1 space-y-1">
                {Object.entries(s.documents).map(([key, items]) => {
                  if (!items.length) return null;
                  const latest = items[0];
                  return (
                    <li key={key} className="flex items-center justify-between gap-2 text-xs">
                      <span>
                        {COLLECTION_LABELS[key] ?? key} — {latest.file_name} (
                        {formatSize(latest.size)})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          downloadFile(
                            `/submissions/${s.id}/documents/${latest.id}/download`,
                            token,
                            latest.file_name,
                          ).catch(() =>
                            setError("Tidak dapat mengunduh dokumen."),
                          )
                        }
                        className="text-uninus hover:underline"
                      >
                        Unduh
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {s.history && s.history.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-gray-700">Riwayat</p>
              <ul className="mt-1 space-y-1">
                {s.history.map((h) => (
                  <li key={h.id} className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">
                      {h.actor?.name ?? "Sistem"}
                    </span>{" "}
                    · {h.action} · {formatDate(h.performed_at)}
                    {h.note && <span className="text-gray-400"> — {h.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
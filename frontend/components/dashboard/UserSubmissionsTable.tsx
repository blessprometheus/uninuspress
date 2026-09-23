"use client";

import { useState, type FormEvent, Fragment } from "react";
import { api, ApiError, downloadFile, openFileInNewTab, firstError } from "@/lib/api";
import type { Submission, SubmissionActionResponse } from "@/lib/types";
import { STAGES } from "@/lib/types";
import {
  actionLabel,
  STATUS_TONE_CLASSES,
  statusText,
  statusTone,
} from "@/lib/labels";

const COLLECTION_LABELS: Record<string, string> = {
  synopsis: "Sinopsis",
  manuscript: "Naskah Word",
  cover_front: "Cover Depan",
  cover_back: "Cover Belakang",
  payment_receipt: "Kwitansi Lunas Keuangan",
  plagiarism_check: "Bukti Cek Plagiasi",
  submission_receipt: "Bukti Pengajuan (PDF)",
};

const USER_COLLECTIONS = [
  "synopsis",
  "manuscript",
  "cover_front",
  "cover_back",
  "payment_receipt",
  "plagiarism_check",
];

/** Ketentuan file per dokumen (docs/requirements.md #6). */
const DOC_META: Record<string, { note: string; accept: string }> = {
  synopsis: { note: "DOC/PDF, maks 10 MB", accept: ".doc,.docx,.pdf" },
  manuscript: { note: "DOCX/DOC, maks 20 MB", accept: ".doc,.docx" },
  cover_front: { note: "JPG/PNG, maks 5 MB", accept: ".jpg,.jpeg,.png" },
  cover_back: { note: "JPG/PNG, maks 5 MB", accept: ".jpg,.jpeg,.png" },
  payment_receipt: { note: "JPG/PNG, maks 5 MB", accept: ".jpg,.jpeg,.png" },
  plagiarism_check: { note: "PDF", accept: ".pdf" },
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uninus focus-visible:ring-offset-2";

function resubmitMessage(stage: string): string {
  if (stage === STAGES.PERPUSNAS_RESULT_RECEIVED) {
    return "Pengajuan selesai. Terima kasih.";
  }
  if (stage === STAGES.NEEDS_USER_REVISION_EXECUTOR) {
    return "Pengajuan dikirim ulang ke pelaksana yang sama untuk direview.";
  }
  return "Pengajuan berhasil dikirim untuk diverifikasi admin.";
}

function latestRevisionNote(s: Submission) {
  const notes = (s.history ?? []).filter(
    (h) => h.action === "REVISION_REQUESTED" && h.note,
  );
  if (notes.length === 0) return null;
  return notes.reduce((a, b) => (a.performed_at > b.performed_at ? a : b));
}

function formatDate(iso?: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Props {
  submissions: Submission[];
  token: string;
  onDone: () => void;
}

export default function UserSubmissionsTable({
  submissions,
  token,
  onDone,
}: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [errorId, setErrorId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function isEditable(stage: string): boolean {
    return (
      stage === STAGES.DRAFT ||
      stage === STAGES.NEEDS_USER_REVISION_ADMIN ||
      stage === STAGES.NEEDS_USER_REVISION_EXECUTOR
    );
  }

  function docsUploaded(s: Submission): number {
    if (!s.documents) return 0;
    return USER_COLLECTIONS.filter(
      (key) => (s.documents?.[key as keyof typeof s.documents]?.length ?? 0) > 0,
    ).length;
  }

  async function act(s: Submission, path: string, body?: Record<string, unknown>) {
    setBusyId(s.id);
    setErrorId(null);
    setErrorMsg(null);
    setSuccessId(null);
    try {
      const res = await api<SubmissionActionResponse>(path, {
        method: "POST",
        token,
        body,
      });
      setSuccessId(s.id);
      setSuccessMsg(resubmitMessage(s.current_stage));
      onDone();
    } catch (err) {
      setErrorId(s.id);
      setErrorMsg(
        err instanceof ApiError ? firstError(err.errors, err.message) : "Aksi gagal.",
      );
      setSuccessId(null);
    } finally {
      setBusyId(null);
    }
  }

  async function handlePrint(s: Submission) {
    const receipt = s.documents?.submission_receipt?.[0];
    if (!receipt) return;
    setBusyId(s.id);
    setErrorId(null);
    setErrorMsg(null);
    try {
      await openFileInNewTab(
        `/submissions/${s.id}/documents/${receipt.id}/download`,
        token,
      );
    } catch {
      setErrorId(s.id);
      setErrorMsg("Tidak dapat membuka bukti pengajuan.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUpload(s: Submission, e: FormEvent, collection: string) {
    e.preventDefault();
    const formEl = e.currentTarget as HTMLFormElement;
    const fileInput = formEl.elements.namedItem("file") as HTMLInputElement | null;
    const file = fileInput?.files?.[0];
    if (!file) return;

    const label = COLLECTION_LABELS[collection] ?? collection;
    const form = new FormData();
    form.append("collection", collection);
    form.append("file", file);

    setBusyId(s.id);
    setErrorId(null);
    setErrorMsg(null);
    setSuccessId(null);
    try {
      await api<SubmissionActionResponse>(
        `/submissions/${s.id}/documents`,
        { method: "POST", token, form },
      );
      setSuccessId(s.id);
      setSuccessMsg(`Dokumen "${label}" berhasil diunggah: ${file.name}.`);
      formEl.reset();
      onDone();
    } catch (err) {
      setErrorId(s.id);
      setErrorMsg(
        err instanceof ApiError ? firstError(err.errors, err.message) : "Upload gagal.",
      );
    } finally {
      setBusyId(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Belum ada pengajuan. Klik tombol &quot;+ Buat Draft Pengajuan&quot;
        untuk memulai.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">ID</th>
            <th className="px-4 py-3 font-semibold">Judul</th>
            <th className="hidden px-4 py-3 font-semibold md:table-cell">Kategori</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="hidden px-4 py-3 font-semibold md:table-cell">Dokumen</th>
            <th className="hidden px-4 py-3 font-semibold lg:table-cell">Dibuat</th>
            <th className="px-4 py-3 text-right font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {submissions.map((s) => {
            const editable = isEditable(s.current_stage);
            const uploaded = docsUploaded(s);
            const expanded = expandedId === s.id;
            const revision = latestRevisionNote(s);
            return (
              <Fragment key={s.id}>
                <tr className="align-top hover:bg-gray-50/60">
                  <td className="hidden px-4 py-3 font-mono text-sm text-gray-500 sm:table-cell">#{s.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {s.title}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-600 md:table-cell">{s.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${STATUS_TONE_CLASSES[statusTone(s.current_stage)]}`}
                    >
                      {statusText(s)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {uploaded === USER_COLLECTIONS.length ? (
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                        Lengkap
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        {uploaded}/{USER_COLLECTIONS.length}
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">
                    {formatDate(s.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {(s.documents?.submission_receipt?.length ?? 0) > 0 && (
                        <button
                          type="button"
                          disabled={busyId === s.id}
                          onClick={() => handlePrint(s)}
                          title="Buka & cetak bukti pengajuan"
                          className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-uninus px-5 py-2 text-sm font-semibold text-uninus transition-colors hover:bg-uninus hover:text-white disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                          </svg>
                          Cetak Bukti
                        </button>
                      )}
                      {editable && (
                        <button
                          type="button"
                          disabled={busyId === s.id}
                          onClick={() =>
                            act(s, `/submissions/${s.id}/submit`)
                          }
                          className={`inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full bg-uninus px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-uninus-dark disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
                        >
                          {busyId === s.id ? "Memproses..." : "Ajukan"}
                        </button>
                      )}
                      {s.current_stage === STAGES.PERPUSNAS_RESULT_RECEIVED && (
                        <button
                          type="button"
                          disabled={busyId === s.id}
                          onClick={() =>
                            act(s, `/submissions/${s.id}/finalize`)
                          }
                          className={`inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full bg-green-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
                        >
                          Selesaikan
                        </button>
                      )}
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() =>
                          setExpandedId(expanded ? null : s.id)
                        }
                        className={`inline-flex min-h-[44px] items-center justify-center whitespace-nowrap rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-uninus hover:text-uninus ${FOCUS_RING}`}
                      >
                        {expanded ? "Tutup" : "Kelola"}
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded && (
                  <tr key={`${s.id}-detail`} className="bg-gray-50/40">
                    <td colSpan={7} className="px-4 py-4">
                      {revision && (
                        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                          <p className="font-semibold text-amber-900">
                            Catatan perbaikan dari {revision.actor?.name ?? "tim UNINUS Press"}:
                          </p>
                          <p className="mt-1 leading-relaxed text-amber-800">
                            {revision.note}
                          </p>
                        </div>
                      )}
                      {errorId === s.id && (
                        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                          {errorMsg ?? "Terjadi kesalahan. Periksa kembali file dan koneksi Anda."}
                        </div>
                      )}
                      {successId === s.id && successMsg && (
                        <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                          <svg
                            className="h-5 w-5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>{successMsg}</span>
                        </div>
                      )}

                      {editable && (
                        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                          <p className="mb-3 text-sm font-semibold text-gray-700">
                            Unggah Dokumen
                          </p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {USER_COLLECTIONS.map((key) => (
                              <form
                                key={key}
                                onSubmit={(e) => handleUpload(s, e, key)}
                                className="flex flex-wrap items-end justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-gray-700">
                                    {COLLECTION_LABELS[key]}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {DOC_META[key]?.note}
                                  </p>
                                  {(s.documents?.[
                                    key as keyof typeof s.documents
                                  ]?.length ?? 0) > 0 ? (
                                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                      <svg
                                        className="h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                      Terunggah (v
                                      {s.documents?.[
                                        key as keyof typeof s.documents
                                      ]?.length ?? 0}
                                      )
                                    </span>
                                  ) : (
                                    <p className="text-xs text-gray-500">
                                      Belum ada
                                    </p>
                                  )}
                                  <input
                                    type="file"
                                    name="file"
                                    required
                                    accept={DOC_META[key]?.accept}
                                    className="mt-2 block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-uninus-soft file:px-4 file:py-2 file:text-xs file:font-semibold file:text-uninus-dark"
                                  />
                                </div>
                                <button
                                  type="submit"
                                  disabled={busyId === s.id}
                                  className={`inline-flex min-h-[44px] items-center justify-center rounded-full border border-uninus px-5 py-2 text-sm font-semibold text-uninus transition-colors hover:bg-uninus hover:text-white disabled:cursor-not-allowed disabled:opacity-60 ${FOCUS_RING}`}
                                >
                                  {(s.documents?.[
                                    key as keyof typeof s.documents
                                  ]?.length ?? 0) > 0
                                    ? "Unggah Ulang"
                                    : "Unggah"}
                                </button>
                              </form>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1 text-sm text-gray-600">
                        {s.synopsis && (
                          <p className="leading-relaxed">{s.synopsis}</p>
                        )}
                        {s.documents && (
                          <div className="mt-2">
                            <p className="font-semibold text-gray-700">
                              Dokumen
                            </p>
                            <ul className="mt-1 space-y-1">
                              {Object.entries(s.documents).map(
                                ([key, items]) => {
                                  if (!items.length) return null;
                                  const latest = items[0];
                                  return (
                                    <li
                                      key={key}
                                      className="flex items-center justify-between gap-2 text-xs"
                                    >
                                      <span>
                                        {COLLECTION_LABELS[key] ?? key} —{" "}
                                        {latest.file_name}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          downloadFile(
                                            `/submissions/${s.id}/documents/${latest.id}/download`,
                                            token,
                                            latest.file_name,
                                          ).catch(() =>
                                            setErrorId(s.id),
                                          )
                                        }
                                        className={`rounded underline-offset-2 text-uninus hover:underline ${FOCUS_RING}`}
                                      >
                                        Unduh
                                      </button>
                                    </li>
                                  );
                                },
                              )}
                            </ul>
                          </div>
                        )}
                        {s.history && s.history.length > 0 && (
                          <div className="mt-2">
                            <p className="font-semibold text-gray-700">
                              Riwayat
                            </p>
                            <ul className="mt-1 space-y-1">
                              {s.history.map((h) => (
                                <li
                                  key={h.id}
                                  className="text-xs text-gray-600"
                                >
                                  <span className="font-medium text-gray-800">
                                    {h.actor?.name ?? "Sistem"}
                                  </span>{" "}
                                  · {actionLabel(h.action)} ·{" "}
                                  {formatDate(h.performed_at)}
                                  {h.note && (
                                    <span className="font-medium text-gray-700">
                                      {" "}
                                      — {h.note}
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

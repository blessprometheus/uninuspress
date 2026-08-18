"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import {
  MANUSCRIPT_NEXT_TRANSITIONS,
  MANUSCRIPT_STATUS_LABEL,
} from "@/lib/labels";

type Manuscript = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  files: { id: string; type: string; originalName: string; verified: boolean }[];
};

export default function PengajuanPage() {
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");
  const [acting, setActing] = useState("");
  const [fileBusy, setFileBusy] = useState("");

  async function load() {
    try {
      const url = filter ? `/manuscripts?status=${filter}` : "/manuscripts";
      setManuscripts(await fetchApi<Manuscript[]>(url));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function changeStatus(id: string, status: string) {
    setActing(id);
    setError("");
    try {
      await fetchApi(`/manuscripts/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setActing("");
    }
  }

  async function download(fileId: string) {
    setError("");
    try {
      const res = await fetchApi<{ url: string }>(
        `/manuscripts/${fileId}/download-url`,
        { method: "POST" },
      );
      window.open(res.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunduh berkas");
    }
  }

  async function toggleVerify(fileId: string, verified: boolean) {
    setFileBusy(fileId);
    setError("");
    try {
      await fetchApi(`/manuscripts/${fileId}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ verified }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal verifikasi berkas");
    } finally {
      setFileBusy("");
    }
  }

  return (
    <>
      <h1 className="admin-page-title">Pengajuan Naskah</h1>
      <p className="admin-page-desc">Kelola dan review semua pengajuan naskah.</p>

      <div style={{ marginBottom: 16 }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-border)", font: "inherit" }}
        >
          <option value="">Semua Status</option>
          {Object.entries(MANUSCRIPT_STATUS_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="form-msg error" style={{ marginBottom: 16 }}>{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Judul</th>
              <th>Penulis</th>
              <th>Status</th>
              <th>File</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {manuscripts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--color-muted)" }}>
                  Tidak ada pengajuan.
                </td>
              </tr>
            )}
            {manuscripts.map((ms) => (
              <tr key={ms.id}>
                <td><strong>{ms.title}</strong></td>
                <td>
                  {ms.user.name}
                  <br />
                  <small style={{ color: "var(--color-muted)" }}>{ms.user.email}</small>
                </td>
                <td>
                  <span className={`badge badge-${ms.status.toLowerCase()}`}>
                    {MANUSCRIPT_STATUS_LABEL[ms.status] ?? ms.status}
                  </span>
                </td>
                <td>
                  {ms.files.length === 0 && "—"}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ms.files.map((f) => (
                      <div
                        key={f.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <span style={{ fontSize: 13 }}>
                          {f.originalName}
                          <span
                            className={`badge ${f.verified ? "badge-published" : "badge-draft"}`}
                            style={{ marginLeft: 6 }}
                          >
                            {f.verified ? "Terverifikasi" : "Belum"}
                          </span>
                        </span>
                        <button
                          className="btn btn-outline btn-sm2"
                          onClick={() => download(f.id)}
                          disabled={fileBusy === f.id}
                        >
                          Unduh
                        </button>
                        <button
                          className="btn btn-outline btn-sm2"
                          onClick={() => toggleVerify(f.id, !f.verified)}
                          disabled={fileBusy === f.id}
                        >
                          {f.verified ? "Batal Verifikasi" : "Verifikasi"}
                        </button>
                      </div>
                    ))}
                  </div>
                </td>
                <td>{new Date(ms.createdAt).toLocaleDateString("id-ID")}</td>
                <td>
                  <div className="row-actions">
                    {(MANUSCRIPT_NEXT_TRANSITIONS[ms.status] ?? []).map((t) => (
                      <button
                        key={t.to}
                        className="btn btn-primary btn-sm2"
                        onClick={() => changeStatus(ms.id, t.to)}
                        disabled={acting === ms.id}
                      >
                        {t.label}
                      </button>
                    ))}
                    {(MANUSCRIPT_NEXT_TRANSITIONS[ms.status] ?? []).length === 0 && (
                      <small style={{ color: "var(--color-muted)" }}>—</small>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

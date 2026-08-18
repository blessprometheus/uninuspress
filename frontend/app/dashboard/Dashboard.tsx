"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { fetchApi, fetchApiFormData } from "@/lib/api";
import { MANUSCRIPT_STATUS_LABEL } from "@/lib/labels";
import ManuscriptForm from "./ManuscriptForm";
import "./dashboard.css";

type ManuscriptFile = {
  id: string;
  type: "MANUSCRIPT" | "COVER" | "PROPOSAL";
  originalName: string;
  size: number;
};

type Manuscript = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  files: ManuscriptFile[];
};

const AUTHOR_QUICK_LINKS = [
  { href: "/layanan", label: "Layanan" },
  { href: "/paket-penerbitan", label: "Harga Paket" },
  { href: "/toko-buku", label: "Toko Buku" },
  { href: "/kontak", label: "Kontak" },
];

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [dataStatus, setDataStatus] = useState<"loading" | "error" | "ok">(
    "loading",
  );
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    setDataStatus("loading");
    fetchApi<Manuscript[]>("/manuscripts")
      .then((data) => {
        setManuscripts(data);
        setDataStatus("ok");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
        setDataStatus("error");
      });
  }, [user, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  if (loading) {
    return <div className="dashboard container">Memuat...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard container">
      <div className="dashboard-head">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-welcome">
            Hai, {user.name}. Kelola pengajuan naskah Anda di sini.
          </p>
        </div>
      </div>

      {(user.role === "ADMIN" || user.role === "EDITOR") && (
        <p className="muted" style={{ marginBottom: "var(--space-4)" }}>
          Anda login sebagai {user.role === "ADMIN" ? "Administrator" : "Editor"}.{" "}
          <Link href="/admin" className="auth-link">
            Buka Panel Admin &rarr;
          </Link>
        </p>
      )}

      {user.role === "AUTHOR" && (
        <div
          style={{
            marginBottom: "var(--space-4)",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {AUTHOR_QUICK_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="btn btn-outline btn-sm2">
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <ManuscriptForm onCreated={refresh} />

      <h2 className="dashboard-section">Pengajuan Naskah</h2>

      {dataStatus === "loading" && <p className="muted">Memuat pengajuan...</p>}
      {dataStatus === "error" && <p className="form-msg error">{error}</p>}

      {dataStatus === "ok" && manuscripts.length === 0 && (
        <p className="empty-state">Belum ada pengajuan naskah.</p>
      )}

      <div className="ms-list">
        {manuscripts.map((ms) => (
          <ManuscriptCard key={ms.id} manuscript={ms} onChanged={refresh} />
        ))}
      </div>
    </div>
  );
}

function ManuscriptCard({
  manuscript,
  onChanged,
}: {
  manuscript: Manuscript;
  onChanged: () => void;
}) {
  const [uploading, setUploading] = useState("");
  const [uploadError, setUploadError] = useState("");

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "MANUSCRIPT" | "COVER" | "PROPOSAL",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(type);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append(type.toLowerCase(), file);
      await fetchApiFormData(`/manuscripts/${manuscript.id}/files`, formData);
      onChanged();
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Gagal meng-upload file",
      );
    } finally {
      setUploading("");
    }
  }

  const canEdit = manuscript.status === "DRAFT" || manuscript.status === "SUBMITTED";

  return (
    <div className="ms-card">
      <div className="ms-header">
        <h3>{manuscript.title}</h3>
        <span className={`status-badge status-${manuscript.status.toLowerCase()}`}>
          {MANUSCRIPT_STATUS_LABEL[manuscript.status] ?? manuscript.status}
        </span>
      </div>
      <p className="ms-desc">{manuscript.description}</p>

      <div className="ms-files">
        <span className="ms-label">File:</span>
        {manuscript.files.length === 0 && (
          <span className="muted">Belum ada file</span>
        )}
        {manuscript.files.map((f) => (
          <span key={f.id} className="file-chip">
            {f.type}: {f.originalName}
          </span>
        ))}
      </div>

      {canEdit && (
        <div className="ms-upload">
          {(["MANUSCRIPT", "COVER", "PROPOSAL"] as const).map((type) => (
            <label key={type} className="upload-btn">
              {uploading === type
                ? "Meng-upload..."
                : `Upload ${type === "MANUSCRIPT" ? "Manuskrip" : type === "COVER" ? "Sampul" : "Proposal"}`}
              <input
                type="file"
                hidden
                onChange={(e) => handleUpload(e, type)}
                disabled={uploading !== ""}
              />
            </label>
          ))}
        </div>
      )}
      {uploadError && <p className="form-msg error">{uploadError}</p>}
    </div>
  );
}
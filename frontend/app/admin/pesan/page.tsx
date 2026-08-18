"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function PesanPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");

  async function load() {
    setMessages(await fetchApi<Message[]>("/contact"));
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function markRead(id: string) {
    await fetchApi(`/contact/${id}/read`, { method: "PATCH" });
    await load();
  }

  return (
    <>
      <h1 className="admin-page-title">Pesan Kontak</h1>
      <p className="admin-page-desc">Pesan masuk dari formulir kontak.</p>

      {error && <p className="form-msg error">{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Subjek</th>
              <th>Pesan</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--color-muted)" }}>
                  Belum ada pesan.
                </td>
              </tr>
            )}
            {messages.map((m) => (
              <tr key={m.id} style={{ opacity: m.read ? 0.6 : 1 }}>
                <td>
                  {m.name}
                  <br />
                  <small style={{ color: "var(--color-muted)" }}>{m.email}</small>
                </td>
                <td>{m.subject}</td>
                <td style={{ maxWidth: 300 }}>{m.message}</td>
                <td>{new Date(m.createdAt).toLocaleDateString("id-ID")}</td>
                <td>
                  {!m.read ? (
                    <button className="btn btn-outline btn-sm2" onClick={() => markRead(m.id)}>
                      Tandai Dibaca
                    </button>
                  ) : (
                    <small style={{ color: "var(--color-muted)" }}>Dibaca</small>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

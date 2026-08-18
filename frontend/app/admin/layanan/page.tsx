"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

type Service = {
  id: string;
  title: string;
  description: string;
  icon?: string | null;
  sortOrder: number;
  active: boolean;
};

const EMPTY = { title: "", description: "", icon: "", sortOrder: 0 };

export default function LayananPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setServices(await fetchApi<Service[]>("/cms/services/all"));
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        ...form,
        icon: form.icon || undefined,
        sortOrder: Number(form.sortOrder),
      };
      if (editId) {
        await fetchApi(`/cms/services/${editId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi("/cms/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setForm(EMPTY);
      setEditId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    }
  }

  async function toggleActive(service: Service) {
    await fetchApi(`/cms/services/${service.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !service.active }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Hapus layanan ini?")) return;
    await fetchApi(`/cms/services/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <>
      <h1 className="admin-page-title">Layanan</h1>
      <p className="admin-page-desc">Kelola daftar layanan yang tampil di beranda.</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Judul
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </label>
        <label>
          Ikon (emoji)
          <input
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            placeholder="📘"
          />
        </label>
        <label className="full">
          Deskripsi
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </label>
        <label>
          Urutan
          <input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
        </label>
        {error && <p className="form-msg error full">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-sm2">
            {editId ? "Simpan Perubahan" : "Tambah Layanan"}
          </button>
          {editId && (
            <button
              type="button"
              className="btn btn-outline btn-sm2"
              onClick={() => {
                setEditId(null);
                setForm(EMPTY);
              }}
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ikon</th>
              <th>Judul</th>
              <th>Urutan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td style={{ fontSize: 20 }}>{s.icon ?? "—"}</td>
                <td>{s.title}</td>
                <td>{s.sortOrder}</td>
                <td>
                  <span className={`badge ${s.active ? "badge-active" : "badge-inactive"}`}>
                    {s.active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn btn-outline btn-sm2"
                      onClick={() => {
                        setEditId(s.id);
                        setForm({
                          title: s.title,
                          description: s.description,
                          icon: s.icon ?? "",
                          sortOrder: s.sortOrder,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn btn-outline btn-sm2" onClick={() => toggleActive(s)}>
                      {s.active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button className="btn btn-danger btn-sm2" onClick={() => remove(s.id)}>
                      Hapus
                    </button>
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

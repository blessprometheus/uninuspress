"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { formatIDR } from "@/lib/format";

type Package = {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  active: boolean;
};

const EMPTY = { name: "", description: "", price: 0, features: "" };

export default function PaketPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    setPackages(await fetchApi<Package[]>("/cms/packages/all"));
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        features: form.features.split("\n").map((f) => f.trim()).filter(Boolean),
      };
      if (editId) {
        await fetchApi(`/cms/packages/${editId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi("/cms/packages", {
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

  async function toggleActive(pkg: Package) {
    await fetchApi(`/cms/packages/${pkg.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !pkg.active }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Hapus paket ini?")) return;
    await fetchApi(`/cms/packages/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <>
      <h1 className="admin-page-title">Paket Harga</h1>
      <p className="admin-page-desc">Kelola paket penerbitan.</p>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Nama Paket
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          Harga (Rp)
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            required
          />
        </label>
        <label className="full">
          Deskripsi
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </label>
        <label className="full">
          Fitur (satu per baris)
          <textarea
            rows={4}
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            placeholder={"Pengurusan ISBN\nTata letak"}
            required
          />
        </label>
        {error && <p className="form-msg error full">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary btn-sm2">
            {editId ? "Simpan Perubahan" : "Tambah Paket"}
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
              <th>Nama</th>
              <th>Harga</th>
              <th>Fitur</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.name}</strong></td>
                <td>{formatIDR(p.price)}</td>
                <td>{p.features.length} fitur</td>
                <td>
                  <span className={`badge ${p.active ? "badge-active" : "badge-inactive"}`}>
                    {p.active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn btn-outline btn-sm2"
                      onClick={() => {
                        setEditId(p.id);
                        setForm({
                          name: p.name,
                          description: p.description,
                          price: Number(p.price),
                          features: p.features.join("\n"),
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button className="btn btn-outline btn-sm2" onClick={() => toggleActive(p)}>
                      {p.active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <button className="btn btn-danger btn-sm2" onClick={() => remove(p.id)}>
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

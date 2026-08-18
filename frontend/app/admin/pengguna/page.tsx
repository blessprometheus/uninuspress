"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchApi } from "@/lib/api";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
};

const ROLES = ["AUTHOR", "EDITOR", "ADMIN"];

export default function PenggunaPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  async function load() {
    setUsers(await fetchApi<User[]>("/users"));
  }
  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function changeRole(id: string, role: string) {
    setError("");
    try {
      await fetchApi(`/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah peran");
    }
  }

  return (
    <>
      <h1 className="admin-page-title">Pengguna</h1>
      <p className="admin-page-desc">Kelola akun dan peran pengguna.</p>

      {error && <p className="form-msg error" style={{ marginBottom: 16 }}>{error}</p>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Peran</th>
              <th>Terdaftar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.name}
                  {me?.id === u.id && (
                    <small style={{ color: "var(--color-muted)" }}> (Anda)</small>
                  )}
                </td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge badge-${u.role === "ADMIN" ? "published" : u.role === "EDITOR" ? "review" : "draft"}`}>
                    {u.role}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString("id-ID")}</td>
                <td>
                  <div className="row-actions">
                    {ROLES.filter((r) => r !== u.role).map((r) => (
                      <button
                        key={r}
                        className="btn btn-outline btn-sm2"
                        onClick={() => changeRole(u.id, r)}
                        disabled={me?.id === u.id}
                      >
                        Jadikan {r}
                      </button>
                    ))}
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

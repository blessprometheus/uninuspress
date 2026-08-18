"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";

type Manuscript = { status: string };

export default function AdminHomePage() {
  const [stats, setStats] = useState({ total: 0, review: 0, users: 0, books: 0 });

  useEffect(() => {
    async function load() {
      try {
        const [manuscripts, users, books] = await Promise.allSettled([
          fetchApi<Manuscript[]>("/manuscripts"),
          fetchApi<unknown[]>("/users"),
          fetchApi<unknown[]>("/books/all"),
        ]);
        const ms = manuscripts.status === "fulfilled" ? manuscripts.value : [];
        setStats({
          total: ms.length,
          review: ms.filter((m) => m.status === "REVIEW" || m.status === "SUBMITTED").length,
          users: users.status === "fulfilled" ? users.value.length : 0,
          books: books.status === "fulfilled" ? books.value.length : 0,
        });
      } catch {
        // biarkan nol
      }
    }
    load();
  }, []);

  return (
    <>
      <h1 className="admin-page-title">Ringkasan</h1>
      <p className="admin-page-desc">Statistik singkat Uninus Press.</p>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Pengajuan</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.review}</div>
          <div className="stat-label">Menunggu Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.users}</div>
          <div className="stat-label">Pengguna</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.books}</div>
          <div className="stat-label">Buku di Katalog</div>
        </div>
      </div>
    </>
  );
}

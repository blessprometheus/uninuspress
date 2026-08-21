"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Pelaksana, Submission } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import CreatePelaksanaForm from "@/components/dashboard/CreatePelaksanaForm";
import CreateSubmissionForm from "@/components/dashboard/CreateSubmissionForm";
import BookManager from "@/components/dashboard/BookManager";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import SubmissionCard from "@/components/dashboard/SubmissionCard";

const ROLE_USER = "USER";
const ROLE_ADMIN = "ADMIN";
const ROLE_PELAKSANA = "PELAKSANA";

export default function DashboardPage() {
  const { user, token, ready, logout, hasRole } = useAuth();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pelaksana, setPelaksana] = useState<Pelaksana[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await api<{ submissions: Submission[] }>("/submissions", { token });
      setError(null);
      setSubmissions(res.submissions);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat pengajuan.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/masuk");
      return;
    }

    async function fetchSubmissions() {
      try {
        const res = await api<{ submissions: Submission[] }>("/submissions", { token });
        setError(null);
        setSubmissions(res.submissions);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Gagal memuat pengajuan.");
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, [ready, user, router, token]);

  useEffect(() => {
    if (user && hasRole(ROLE_ADMIN) && token) {
      api<{ pelaksana: Pelaksana[] }>("/admin/pelaksana", { token })
        .then((res) => setPelaksana(res.pelaksana))
        .catch(() => undefined);
    }
  }, [user, hasRole, token]);

  async function handleLogout() {
    await logout();
    router.replace("/masuk");
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center text-gray-500 sm:px-6">
        Memeriksa sesi...
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = hasRole(ROLE_ADMIN);
  const isPelaksana = hasRole(ROLE_PELAKSANA);
  const isUser = hasRole(ROLE_USER);

  const userSubmissions = submissions.filter((s) => s.user_id === user.id);
  const adminSubmissions = submissions;
  const pelaksanaSubmissions = submissions.filter(
    (s) => s.assigned_executor?.id === user.id,
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Halo, {user.name} — role: {user.roles.join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationsPanel token={token ?? ""} />
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-red-300 hover:text-red-600"
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {isUser && (
          <section>
            <CreateSubmissionForm token={token ?? ""} onDone={refresh} />
          </section>
        )}

        {isUser && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Pengajuan Saya</h2>
            {loading ? (
              <p className="text-sm text-gray-500">Memuat...</p>
            ) : userSubmissions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                Belum ada pengajuan. Buat pengajuan pertama Anda di atas.
              </p>
            ) : (
              <div className="space-y-4">
                {userSubmissions.map((s) => (
                  <SubmissionCard
                    key={s.id}
                    submission={s}
                    token={token ?? ""}
                    isAdmin={false}
                    isOwner
                    isAssignedPelaksana={false}
                    pelaksana={[]}
                    onDone={refresh}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {isPelaksana && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              Pengajuan yang Ditugaskan kepada Saya
            </h2>
            {loading ? (
              <p className="text-sm text-gray-500">Memuat...</p>
            ) : pelaksanaSubmissions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                Belum ada pengajuan yang ditugaskan kepada Anda.
              </p>
            ) : (
              <div className="space-y-4">
                {pelaksanaSubmissions.map((s) => (
                  <SubmissionCard
                    key={s.id}
                    submission={s}
                    token={token ?? ""}
                    isAdmin={false}
                    isOwner={false}
                    isAssignedPelaksana
                    pelaksana={[]}
                    onDone={refresh}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {isAdmin && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Manajemen Admin</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <CreatePelaksanaForm
                token={token ?? ""}
                onDone={() => {
                  api<{ pelaksana: Pelaksana[] }>("/admin/pelaksana", { token })
                    .then((res) => setPelaksana(res.pelaksana))
                    .catch(() => undefined);
                }}
              />
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900">Daftar Pelaksana</h3>
                {pelaksana.length === 0 ? (
                  <p className="mt-2 text-xs text-gray-500">Belum ada pelaksana.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {pelaksana.map((p) => (
                      <li key={p.id} className="text-sm text-gray-700">
                        <span className="font-semibold">{p.name}</span>{" "}
                        <span className="text-gray-500">({p.email})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {isAdmin && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Toko Buku</h2>
            <BookManager token={token ?? ""} submissions={submissions} />
          </section>
        )}

        {isAdmin && (
          <section>
            <h2 className="mb-4 text-lg font-bold text-gray-900">Semua Pengajuan</h2>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            {loading ? (
              <p className="text-sm text-gray-500">Memuat...</p>
            ) : adminSubmissions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                Belum ada pengajuan masuk.
              </p>
            ) : (
              <div className="space-y-4">
                {adminSubmissions.map((s) => (
                  <SubmissionCard
                    key={s.id}
                    submission={s}
                    token={token ?? ""}
                    isAdmin
                    isOwner={false}
                    isAssignedPelaksana={false}
                    pelaksana={pelaksana}
                    onDone={refresh}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
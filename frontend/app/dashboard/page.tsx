"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "@/lib/api";
import type {
  Pelaksana,
  Submission,
  SubmissionListResponse,
} from "@/lib/types";
import { STAGES } from "@/lib/types";
import { stageLabel } from "@/lib/labels";
import { useAuth } from "@/context/AuthContext";
import CreatePelaksanaForm from "@/components/dashboard/CreatePelaksanaForm";
import CreateSubmissionForm from "@/components/dashboard/CreateSubmissionForm";
import UserSubmissionsTable from "@/components/dashboard/UserSubmissionsTable";
import BookManager from "@/components/dashboard/BookManager";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import SubmissionCard from "@/components/dashboard/SubmissionCard";

const ROLE_USER = "USER";
const ROLE_ADMIN = "ADMIN";
const ROLE_PELAKSANA = "PELAKSANA";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uninus focus-visible:ring-offset-2";

const SELECT_CLS = `min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 ${FOCUS_RING}`;

const BTN_GHOST = `inline-flex min-h-[44px] items-center whitespace-nowrap rounded-full border border-uninus px-5 py-2 text-sm font-semibold text-uninus transition-colors hover:bg-uninus hover:text-white ${FOCUS_RING}`;

const PAGE_BTN = `inline-flex min-h-[44px] items-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-uninus hover:text-uninus disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS_RING}`;

function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user, token, ready, logout, hasRole } = useAuth();
  const router = useRouter();

  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [adminSubmissions, setAdminSubmissions] = useState<Submission[]>([]);
  const [executorSubmissions, setExecutorSubmissions] = useState<Submission[]>([]);
  const [latestVaNumber, setLatestVaNumber] = useState<string>('9113015308682026');
  const [pelaksana, setPelaksana] = useState<Pelaksana[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adminFiltered, setAdminFiltered] = useState<Submission[]>([]);
  const [adminMeta, setAdminMeta] = useState<
    SubmissionListResponse["meta"] | null
  >(null);
  const [adminListLoading, setAdminListLoading] = useState(false);
  const [adminStage, setAdminStage] = useState("");
  const [adminExecutorId, setAdminExecutorId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [adminPage, setAdminPage] = useState(1);
  const [dataVersion, setDataVersion] = useState(0);

  const refresh = useCallback(async () => {
    if (!user || !token) return;
    setLoading(true);
    setError(null);
    try {
      const tasks: Array<Promise<void>> = [];
      if (hasRole(ROLE_USER)) {
        tasks.push(
          api<SubmissionListResponse>("/submissions", { token }).then((res) =>
            setUserSubmissions(res.data),
          ),
        );
      }
      if (hasRole(ROLE_ADMIN)) {
        tasks.push(
          api<SubmissionListResponse>("/admin/submissions", { token }).then((res) =>
            setAdminSubmissions(res.data),
          ),
        );
        tasks.push(
          api<{ data: Pelaksana[] }>("/admin/pelaksana", { token })
            .then((res) => setPelaksana(res.data))
            .catch(() => undefined),
        );
      }
      if (hasRole(ROLE_PELAKSANA)) {
        tasks.push(
          api<SubmissionListResponse>("/executor/submissions", { token }).then((res) =>
            setExecutorSubmissions(res.data),
          ),
        );
      }
      await Promise.all(tasks);
      setDataVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal memuat pengajuan.");
    } finally {
      setLoading(false);
    }
  }, [token, user, hasRole]);

  useEffect(() => {
    if (!ready || !user || !token || !hasRole(ROLE_ADMIN)) return;
    let stale = false;
    setAdminListLoading(true);
    const params = new URLSearchParams();
    if (adminStage) params.set("stage", adminStage);
    if (adminExecutorId) params.set("executor_id", adminExecutorId);
    if (appliedSearch) params.set("q", appliedSearch);
    params.set("page", String(adminPage));
    api<SubmissionListResponse>(`/admin/submissions?${params.toString()}`, {
      token,
    })
      .then((res) => {
        if (stale) return;
        setAdminFiltered(res.data);
        setAdminMeta(res.meta);
        setError(null);
      })
      .catch(() => {
        if (!stale) setError("Gagal memuat daftar pengajuan.");
      })
      .finally(() => {
        if (!stale) setAdminListLoading(false);
      });
    return () => {
      stale = true;
    };
  }, [
    ready,
    user,
    token,
    hasRole,
    adminStage,
    adminExecutorId,
    appliedSearch,
    adminPage,
    dataVersion,
  ]);

  useEffect(() => {
    if (!ready || !userSubmissions.length) return;
    const latest = userSubmissions[0];
    setLatestVaNumber(latest.va_number || '9113015308682026');
  }, [userSubmissions]);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/masuk");
      return;
    }
    refresh();
  }, [ready, user, router, refresh]);

  async function handleLogout() {
    await logout();
    router.replace("/masuk");
  }

  function updateStage(v: string) {
    setAdminStage(v);
    setAdminPage(1);
  }

  function updateExecutor(v: string) {
    setAdminExecutorId(v);
    setAdminPage(1);
  }

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setAdminPage(1);
  }

  function resetFilters() {
    setAdminStage("");
    setAdminExecutorId("");
    setSearchInput("");
    setAppliedSearch("");
    setAdminPage(1);
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

  const notifSubmissions = isAdmin
    ? adminSubmissions
    : isPelaksana
      ? executorSubmissions
      : userSubmissions;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Selamat datang kembali, {user.name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationsPanel submissions={notifSubmissions} />
          <button
            type="button"
            onClick={handleLogout}
            className={`inline-flex min-h-[44px] items-center rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-red-300 hover:text-red-600 ${FOCUS_RING}`}
          >
            Keluar
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {isUser && (
          <section className="space-y-4">
            <div className="va-code-card p-4 rounded-lg mb-6 bg-blue-50 border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-3">💳 Pembayaran Virtual Account</h3>
              
              <div className="flex flex-col items-center">
                <div className="text-2xl font-bold text-blue-800 bg-blue-100 rounded px-4 py-2">
                  {latestVaNumber || '9113015308682026'}
                </div>
                <p className="text-sm text-blue-600 mt-2">No. Virtual Account</p>
              </div>
              
              <div className="mt-3 text-xs">
                <p className="text-blue-600 mb-1">Bank: Bank Muamalat</p>
                <p className="text-blue-600">Atas Nama: UNINUS Press</p>
                <p className="text-blue-600">Jumlah: Rp 500.000</p>
              </div>
              
              <p className="mt-3 text-xs text-gray-500">
                Lakukan transfer, lalu unggah kwitansi (JPG/DOC/PDF) saat submit
              </p>
            </div>
            
            <CreateSubmissionForm token={token ?? ""} onDone={refresh} />
          </section>
        )}

        {isUser && (
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Pengajuan Saya</h2>
            {loading ? (
              <ListSkeleton />
            ) : (
              <UserSubmissionsTable
                submissions={userSubmissions}
                token={token ?? ""}
                onDone={refresh}
              />
            )}
          </section>
        )}

        {isPelaksana && (
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">
              Pengajuan yang Ditugaskan kepada Saya
            </h2>
            {loading ? (
              <ListSkeleton />
            ) : executorSubmissions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                Belum ada pengajuan yang ditugaskan kepada Anda.
              </p>
            ) : (
              <div className="space-y-4">
                {executorSubmissions.map((s) => (
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
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Manajemen Admin</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <CreatePelaksanaForm
                token={token ?? ""}
                onDone={() => {
                  api<{ data: Pelaksana[] }>("/admin/pelaksana", { token })
                    .then((res) => setPelaksana(res.data))
                    .catch(() => undefined);
                }}
              />
              <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-ink">Daftar Pelaksana</h3>
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
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Toko Buku</h2>
            <BookManager token={token ?? ""} />
          </section>
        )}

        {isAdmin && (
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-ink">Semua Pengajuan</h2>

            <form
              onSubmit={submitSearch}
              className="mb-5 grid gap-3 sm:grid-cols-[minmax(0,240px)_minmax(0,220px)_1fr_auto]"
            >
              <div>
                <label htmlFor="filter-stage" className="sr-only">
                  Filter status
                </label>
                <select
                  id="filter-stage"
                  value={adminStage}
                  onChange={(e) => updateStage(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="">Semua Status</option>
                  {Object.values(STAGES).map((st) => (
                    <option key={st} value={st}>
                      {stageLabel(st)} ({st})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="filter-executor" className="sr-only">
                  Filter pelaksana
                </label>
                <select
                  id="filter-executor"
                  value={adminExecutorId}
                  onChange={(e) => updateExecutor(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="">Semua Pelaksana</option>
                  {pelaksana.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex min-w-0 gap-2">
                <label htmlFor="filter-search" className="sr-only">
                  Cari judul atau penulis
                </label>
                <input
                  id="filter-search"
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Cari judul / penulis…"
                  className={`min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-700 ${FOCUS_RING}`}
                />
                <button type="submit" className={BTN_GHOST}>
                  Cari
                </button>
              </div>
              {(adminStage || adminExecutorId || appliedSearch) && (
                <button type="button" onClick={resetFilters} className={BTN_GHOST}>
                  Reset
                </button>
              )}
            </form>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            {adminListLoading ? (
              <ListSkeleton rows={4} />
            ) : adminFiltered.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                {(adminStage || adminExecutorId || appliedSearch)
                  ? "Tidak ada pengajuan yang cocok dengan filter."
                  : "Belum ada pengajuan masuk."}
              </p>
            ) : (
              <div className="space-y-4">
                {adminFiltered.map((s) => (
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

            {adminMeta && adminMeta.last_page > 1 && (
              <nav
                className="mt-6 flex flex-wrap items-center justify-between gap-3"
                aria-label="Navigasi halaman pengajuan"
              >
                <p className="text-xs text-gray-500">
                  Halaman {adminMeta.current_page} dari {adminMeta.last_page} ·{" "}
                  {adminMeta.total} pengajuan
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={adminPage <= 1}
                    onClick={() => setAdminPage((p) => Math.max(1, p - 1))}
                    className={PAGE_BTN}
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={
                      adminMeta ? adminPage >= adminMeta.last_page : true
                    }
                    onClick={() => setAdminPage((p) => p + 1)}
                    className={PAGE_BTN}
                  >
                    Berikutnya
                  </button>
                </div>
              </nav>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
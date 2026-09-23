"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import PageHero from "@/components/PageHero";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export default function DaftarPage() {
  const { register, user, ready } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password, passwordConfirmation);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        const first = err.errors ? Object.values(err.errors).flat()[0] : undefined;
        setError(first ?? err.message);
      } else {
        setError("Gagal mendaftar. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHero title="Daftar Akun" subtitle="Buat akun untuk mulai mengajukan naskah penerbitan Anda." />
      <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
          <h2 className="font-display text-2xl font-semibold text-ink">Buat Akun</h2>
          <p className="mt-1 text-sm text-gray-600">
            Setelah mendaftar, Anda bisa langsung mengajukan naskah.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-semibold text-gray-700">
                Nama Lengkap
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-uninus focus:ring-2 focus:ring-uninus/20"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-uninus focus:ring-2 focus:ring-uninus/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-semibold text-gray-700">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-uninus focus:ring-2 focus:ring-uninus/20"
              />
            </div>
            <div>
              <label htmlFor="password_confirmation" className="mb-1 block text-sm font-semibold text-gray-700">
                Ulangi Kata Sandi
              </label>
              <input
                id="password_confirmation"
                type="password"
                required
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-uninus focus:ring-2 focus:ring-uninus/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-uninus px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-uninus-dark disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Sudah punya akun?{" "}
            <Link href="/masuk" className="font-semibold text-uninus hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
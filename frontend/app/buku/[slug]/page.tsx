"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PageHero from "@/components/PageHero";
import { api, ApiError } from "@/lib/api";
import type { Book } from "@/lib/types";

function formatPrice(value: number | null | undefined): string {
  if (value == null) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function BukuDetailPage() {
  const params = useParams<{ slug: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.slug) return;
    let cancelled = false;
    setLoading(true);
    api<{ book: Book }>(`/books/${params.slug}`)
      .then((res) => {
        if (!cancelled) {
          setBook(res.book);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.status === 404
              ? "Buku tidak ditemukan."
              : "Gagal memuat data buku.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center text-sm text-gray-500 sm:px-6">
        Memuat...
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error ?? "Buku tidak ditemukan."}
        </p>
        <Link
          href="/toko-buku"
          className="mt-6 inline-block rounded-full bg-uninus px-5 py-2.5 text-sm font-semibold text-white hover:bg-uninus-dark"
        >
          Kembali ke Toko Buku
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHero title={book.title} subtitle={book.author} />

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/toko-buku" className="text-sm font-semibold text-uninus hover:underline">
          &larr; Kembali ke Toko Buku
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-[280px_1fr]">
          <div className="mx-auto flex aspect-[3/4] w-full max-w-xs items-center justify-center rounded-2xl bg-uninus-soft p-6 shadow-sm">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="h-full w-full rounded-lg object-cover shadow-md"
              />
            ) : (
              <p className="text-center text-sm font-bold text-uninus-dark">{book.title}</p>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {book.category && (
                <span className="rounded-full bg-uninus-soft px-3 py-1 text-xs font-bold text-uninus">
                  {book.category}
                </span>
              )}
              {book.isbn ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  ISBN {book.isbn}
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  Sedang dalam proses penomoran ISBN
                </span>
              )}
            </div>

            <h2 className="font-display mt-4 text-2xl font-semibold text-ink">{book.title}</h2>
            <p className="mt-1 text-sm text-gray-600">Oleh {book.author}</p>
            {book.year && <p className="mt-1 text-xs text-gray-400">Tahun {book.year}</p>}

            {book.price != null && (
              <p className="mt-4 text-xl font-bold text-uninus">{formatPrice(book.price)}</p>
            )}

            {book.synopsis && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-700">Sinopsis</h3>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {book.synopsis}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

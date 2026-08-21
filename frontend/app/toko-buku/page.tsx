"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";
import { api, ApiError } from "@/lib/api";
import type { Book } from "@/lib/types";
function formatPrice(value: number | null): string {
  if (value === null) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function TokoBukuPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchBooks() {
      try {
        const res = await api<{ books: Book[] }>("/books");
        if (!cancelled) {
          setBooks(res.books);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Gagal memuat buku.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchBooks();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHero
        title="Toko Buku"
        subtitle="Koleksi buku terbitan UNINUS Press dari para penulis terbaik."
      />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          title="Buku Terbitan UNINUS Press"
          subtitle="Buku-buku ini telah melalui proses penerbitan resmi dan mendapatkan ISBN dari Perpustakaan Nasional."
        />

        {loading ? (
          <p className="mt-12 text-center text-sm text-gray-500">Memuat...</p>
        ) : error ? (
          <p className="mt-12 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
            {error}
          </p>
        ) : books.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
            Belum ada buku terbitan yang dipublikasikan. Naskah yang selesai diterbitkan akan
            tampil di sini.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/buku/${book.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-uninus hover:shadow-lg"
              >
                <div className="flex aspect-[3/4] items-center justify-center bg-uninus-soft p-6">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="h-full w-full rounded-lg object-cover shadow-md"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-uninus/30 bg-white p-4">
                      <div className="text-center">
                        <p className="text-sm font-bold leading-snug text-uninus-dark">
                          {book.title}
                        </p>
                        <p className="mt-2 text-xs text-gray-500">{book.year}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className="rounded-full bg-uninus-soft px-3 py-1 text-xs font-bold text-uninus">
                    {book.category}
                  </span>
                  <h3 className="mt-3 text-base font-bold text-gray-900 group-hover:text-uninus-dark">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{book.author}</p>
                  {book.price !== null && (
                    <p className="mt-2 text-sm font-bold text-uninus">{formatPrice(book.price)}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError, firstError } from "@/lib/api";
import type { Book } from "@/lib/types";

interface BookManagerProps {
  token: string;
}

interface BookListResponse {
  books: Book[];
}

interface BookActionResponse {
  message: string;
  book: Book;
}

function formatPrice(value: number | null | undefined): string {
  if (value == null) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function BookRow({
  book,
  token,
  onUpdated,
}: {
  book: Book;
  token: string;
  onUpdated: (book: Book) => void;
}) {
  const [isbn, setIsbn] = useState(book.isbn ?? "");
  const [price, setPrice] = useState(book.price != null ? String(book.price) : "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function saveDetails(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api<BookActionResponse>(`/admin/books/${book.id}`, {
        method: "PATCH",
        token,
        body: {
          isbn: isbn.trim() || null,
          price: price.trim() ? Number(price) : null,
        },
      });
      onUpdated(res.book);
      setSuccess("Data buku disimpan.");
    } catch (err) {
      setError(err instanceof ApiError ? firstError(err.errors, err.message) : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadCover(e: FormEvent) {
    e.preventDefault();
    if (!coverFile) return;
    const form = new FormData();
    form.append("cover", coverFile);

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await api<BookActionResponse>(`/admin/books/${book.id}/cover`, {
        method: "POST",
        token,
        form,
      });
      onUpdated(res.book);
      setCoverFile(null);
      setSuccess("Cover buku diperbarui.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mengunggah cover.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="h-24 w-18 rounded-lg border border-gray-200 object-cover"
            />
          ) : (
            <div className="flex h-24 w-18 items-center justify-center rounded-lg border border-dashed border-gray-300 text-[10px] text-gray-400">
              Tanpa cover
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{book.title}</p>
            <p className="text-xs text-gray-500">{book.author}</p>
            <p className="mt-1 text-xs text-gray-400">/buku/{book.slug}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                book.isbn
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {book.isbn ? `ISBN: ${book.isbn}` : "Menunggu penomoran ISBN"}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>
      )}
      {success && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">{success}</p>
      )}

      <form onSubmit={saveDetails} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-gray-600">
            Nomor ISBN
          </label>
          <input
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="mis. 978-602-xxxx-xx-x"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-gray-600">
            Harga (Rp)
          </label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="numeric"
            placeholder="mis. 75000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-uninus px-4 py-2 text-xs font-semibold text-white hover:bg-uninus-dark disabled:opacity-60 sm:w-auto"
          >
            Simpan
          </button>
        </div>
      </form>

      <form onSubmit={uploadCover} className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className="block flex-1 text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-uninus-soft file:px-4 file:py-2 file:text-xs file:font-semibold file:text-uninus"
        />
        <button
          type="submit"
          disabled={busy || !coverFile}
          className="rounded-full border border-uninus px-4 py-2 text-xs font-semibold text-uninus hover:bg-uninus hover:text-white disabled:opacity-60"
        >
          Ganti Cover (mis. cover ber-ISBN)
        </button>
      </form>
      {formatPrice(book.price) !== "-" && (
        <p className="mt-2 text-xs text-gray-500">Harga saat ini: {formatPrice(book.price)}</p>
      )}
    </div>
  );
}

export default function BookManager({ token }: BookManagerProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api<BookListResponse>("/admin/books", { token })
      .then((res) => {
        if (!cancelled) setBooks(res.books);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Gagal memuat daftar buku.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleUpdated(updated: Book) {
    setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Memuat daftar buku...</p>;
  }
  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }
  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
        Belum ada buku yang tampil di Toko Buku. Buku otomatis muncul di sini begitu
        pengajuan diusulkan ke Perpusnas.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Buku tampil ke publik sejak diusulkan ke Perpusnas (untuk keperluan pencantuman
        link pada daftar pengajuan ISBN) memakai cover sementara dari dokumen pengajuan.
        Ganti cover dan isi nomor ISBN di sini setelah nomor ISBN terbit.
      </p>
      {books.map((book) => (
        <BookRow key={book.id} book={book} token={token} onUpdated={handleUpdated} />
      ))}
    </div>
  );
}

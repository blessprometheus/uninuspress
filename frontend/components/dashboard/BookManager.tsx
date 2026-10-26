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

const INPUT_CLS =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-uninus";
const LABEL_CLS = "mb-1 block text-[11px] font-semibold text-gray-600";

function AddBookForm({
  token,
  onCreated,
}: {
  token: string;
  onCreated: (book: Book) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("BUKU");
  const [isbn, setIsbn] = useState("");
  const [price, setPrice] = useState("");
  const [year, setYear] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setTitle("");
    setAuthor("");
    setCategory("BUKU");
    setIsbn("");
    setPrice("");
    setYear("");
    setSynopsis("");
    setCoverFile(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError("Judul dan penulis wajib diisi.");
      return;
    }
    const form = new FormData();
    form.append("title", title.trim());
    form.append("author", author.trim());
    if (category.trim()) form.append("category", category.trim());
    if (isbn.trim()) form.append("isbn", isbn.trim());
    if (price.trim()) form.append("price", price.trim());
    if (year.trim()) form.append("year", year.trim());
    if (synopsis.trim()) form.append("synopsis", synopsis.trim());
    if (coverFile) form.append("cover", coverFile);

    setBusy(true);
    setError(null);
    try {
      const res = await api<BookActionResponse>("/admin/books", {
        method: "POST",
        token,
        form,
      });
      onCreated(res.book);
      reset();
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? firstError(err.errors, err.message) : "Gagal menambahkan buku.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-uninus px-5 py-2.5 text-sm font-semibold text-white hover:bg-uninus-dark"
      >
        + Tambah Buku Baru
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-uninus/30 bg-uninus-soft/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">Tambah Buku Baru</h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
            setError(null);
          }}
          className="text-xs font-semibold text-gray-500 hover:text-gray-700"
        >
          Batal
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLS}>Judul *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT_CLS} required />
          </div>
          <div>
            <label className={LABEL_CLS}>Penulis *</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className={INPUT_CLS} required />
          </div>
          <div>
            <label className={LABEL_CLS}>Kategori</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Tahun Terbit</label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder={String(new Date().getFullYear())}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Nomor ISBN</label>
            <input value={isbn} onChange={(e) => setIsbn(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Harga (Rp)</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
              className={INPUT_CLS}
            />
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>Sinopsis</label>
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={3}
            className={INPUT_CLS}
          />
        </div>
        <div>
          <label className={LABEL_CLS}>Cover</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-uninus"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-uninus px-5 py-2.5 text-sm font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
        >
          {busy ? "Menyimpan..." : "Simpan Buku"}
        </button>
      </form>
    </div>
  );
}

function BookRow({
  book,
  token,
  onUpdated,
  onDeleted,
}: {
  book: Book;
  token: string;
  onUpdated: (book: Book) => void;
  onDeleted: (id: number) => void;
}) {
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [category, setCategory] = useState(book.category ?? "");
  const [year, setYear] = useState(book.year != null ? String(book.year) : "");
  const [isbn, setIsbn] = useState(book.isbn ?? "");
  const [price, setPrice] = useState(book.price != null ? String(book.price) : "");
  const [synopsis, setSynopsis] = useState(book.synopsis ?? "");
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
          title: title.trim(),
          author: author.trim(),
          category: category.trim() || null,
          year: year.trim() || null,
          isbn: isbn.trim() || null,
          price: price.trim() ? Number(price) : null,
          synopsis: synopsis.trim() || null,
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

  async function handleDelete() {
    if (!confirm(`Hapus buku "${book.title}" dari Toko Buku? Tindakan ini tidak bisa dibatalkan.`)) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api<{ message: string }>(`/admin/books/${book.id}`, {
        method: "DELETE",
        token,
      });
      onDeleted(book.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menghapus buku.");
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
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  book.isbn
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {book.isbn ? `ISBN: ${book.isbn}` : "Menunggu penomoran ISBN"}
              </span>
              {!book.submission_id && (
                <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                  Ditambahkan manual
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="shrink-0 rounded-full border border-red-300 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          Hapus
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>
      )}
      {success && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-green-700">{success}</p>
      )}

      <form onSubmit={saveDetails} className="mt-3 space-y-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLS}>Judul</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Penulis</label>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Kategori</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Tahun</label>
            <input value={year} onChange={(e) => setYear(e.target.value)} className={INPUT_CLS} />
          </div>
          <div>
            <label className={LABEL_CLS}>Nomor ISBN</label>
            <input
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              placeholder="mis. 978-602-xxxx-xx-x"
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Harga (Rp)</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
              placeholder="mis. 75000"
              className={INPUT_CLS}
            />
          </div>
        </div>
        <div>
          <label className={LABEL_CLS}>Sinopsis</label>
          <textarea
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            rows={2}
            className={INPUT_CLS}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-uninus px-4 py-2 text-xs font-semibold text-white hover:bg-uninus-dark disabled:opacity-60"
        >
          Simpan Perubahan
        </button>
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
          Ganti Cover
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

  function handleCreated(created: Book) {
    setBooks((prev) => [created, ...prev]);
  }

  function handleDeleted(id: number) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Memuat daftar buku...</p>;
  }
  if (error) {
    return <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Buku dari pengajuan tampil otomatis sejak diusulkan ke Perpusnas (cover sementara
        dari dokumen pengajuan). Kamu juga bisa menambahkan buku lain secara manual,
        mengubah datanya, atau menghapusnya di sini.
      </p>

      <AddBookForm token={token} onCreated={handleCreated} />

      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Belum ada buku di Toko Buku.
        </div>
      ) : (
        <div className="space-y-3">
          {books.map((book) => (
            <BookRow
              key={book.id}
              book={book}
              token={token}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}

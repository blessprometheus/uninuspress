import type { Metadata } from "next";
import { fetchApi } from "@/lib/api";
import "../page.css";

export const metadata: Metadata = { title: "Toko Buku" };

type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  externalUrl?: string | null;
};

const FALLBACK_BOOKS: Book[] = [
  {
    id: "dummy1",
    title: "Contoh Judul Buku 1",
    author: "Penulis A",
    description:
      "Deskripsi buku contoh. Data ini akan diganti oleh buku dari backend.",
    externalUrl: "https://bookstore.uninus.ac.id",
  },
  {
    id: "dummy2",
    title: "Contoh Judul Buku 2",
    author: "Penulis B",
    description:
      "Deskripsi buku contoh kedua. Data ini akan diganti oleh buku dari backend.",
    externalUrl: "https://www.tokopedia.com",
  },
];

async function getBooks(): Promise<Book[]> {
  try {
    const data = await fetchApi<Book[]>("/books");
    return data.length > 0 ? data : FALLBACK_BOOKS;
  } catch {
    return FALLBACK_BOOKS;
  }
}

export default async function TokoBukuPage() {
  const books = await getBooks();

  return (
    <div className="container static-page">
      <h1 className="page-title">Toko Buku</h1>
      <p className="page-lead">
        Jelajahi katalog buku terbitan Uninus Press. Pembelian dilakukan melalui
        toko mitra eksternal.
      </p>

      <div className="book-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            <div className="book-cover" aria-hidden="true">
              📖
            </div>
            <div className="book-info">
              <h3>{book.title}</h3>
              <p className="book-author">oleh {book.author}</p>
              <p className="book-desc">{book.description}</p>
            </div>
            {book.externalUrl && (
              <a
                href={book.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-block"
              >
                Beli di Toko Mitra
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

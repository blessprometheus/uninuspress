<?php

namespace App\Services;

use App\Models\Book;
use App\Models\Submission;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Publish & kelola buku di Toko Buku.
 *
 * Lihat catatan di App\Models\Book: buku dipublish otomatis saat submission
 * masuk PERPUSNAS_SUBMISSION (sebelum ISBN terbit), lalu admin mengganti
 * cover setelah nomor ISBN didapat dari Perpustakaan Nasional.
 */
class BookService
{
    /**
     * Buat entri buku dari submission (idempotent — dipanggil tiap kali
     * submission diusulkan ke Perpusnas, tapi hanya buat sekali).
     */
    public function publishFromSubmission(Submission $submission): Book
    {
        $existing = Book::where('submission_id', $submission->id)->first();
        if ($existing) {
            return $existing;
        }

        $book = Book::create([
            'submission_id' => $submission->id,
            'slug' => $this->uniqueSlug($submission->title),
            'title' => $submission->title,
            'author' => $submission->author_name,
            'synopsis' => $submission->synopsis,
            'category' => $submission->category,
            'year' => (string) now()->year,
            'is_published' => true,
            'published_at' => now(),
        ]);

        $coverFront = $submission->latestDocument(Submission::COLLECTION_COVER_FRONT);
        if ($coverFront) {
            $coverFront->copy($book, Book::COLLECTION_COVER);
        }

        return $book;
    }

    /**
     * Admin menambahkan buku secara manual (tidak terkait submission),
     * mis. terbitan lama yang belum pernah masuk alur pengajuan sistem ini.
     */
    public function createManual(array $data, ?UploadedFile $cover = null): Book
    {
        $book = Book::create([
            'submission_id' => null,
            'slug' => $this->uniqueSlug($data['title']),
            'title' => $data['title'],
            'author' => $data['author'],
            'synopsis' => $data['synopsis'] ?? null,
            'category' => $data['category'] ?? null,
            'isbn' => $data['isbn'] ?? null,
            'price' => $data['price'] ?? null,
            'year' => $data['year'] ?? (string) now()->year,
            'is_published' => true,
            'published_at' => now(),
        ]);

        if ($cover) {
            $this->updateCover($book, $cover);
        }

        return $book;
    }

    /** Admin menghapus buku (termasuk cover-nya) dari Toko Buku. */
    public function delete(Book $book): void
    {
        $book->clearMediaCollection(Book::COLLECTION_COVER);
        $book->delete();
    }

    /** Admin mengganti cover (dipakai untuk memasang cover ber-ISBN). */
    public function updateCover(Book $book, UploadedFile $file): Media
    {
        return $book->addMedia($file)
            ->usingFileName('cover_'.Str::slug($book->slug).'_'.time().'.'.$file->getClientOriginalExtension())
            ->toMediaCollection(Book::COLLECTION_COVER);
    }

    /** Admin mengubah data buku (isbn, harga, kategori, dll). */
    public function updateDetails(Book $book, array $data): Book
    {
        $book->fill(Arr::only($data, [
            'title', 'author', 'synopsis', 'category', 'isbn', 'price', 'year', 'is_published',
        ]));
        $book->save();

        return $book;
    }

    private function uniqueSlug(string $title): string
    {
        $base = Str::slug($title) ?: 'buku';
        $slug = $base;
        $i = 2;
        while (Book::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}

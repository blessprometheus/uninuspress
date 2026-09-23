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

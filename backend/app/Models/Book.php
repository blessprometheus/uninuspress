<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

/**
 * Buku yang tampil di Toko Buku (landing page publik).
 *
 * Dibuat otomatis dari Submission saat admin mengusulkan naskah ke Perpusnas
 * (lihat SubmissionService::submitToPerpusnas()) — bukan menunggu COMPLETED —
 * karena daftar pengajuan ISBN ke Perpusnas mengharuskan pencantuman link buku.
 * Cover awal memakai cover depan yang diunggah user; admin mengganti dengan
 * cover ber-ISBN setelah nomor ISBN terbit (lihat AdminBookController).
 */
#[Fillable([
    'submission_id',
    'slug',
    'title',
    'author',
    'synopsis',
    'category',
    'isbn',
    'price',
    'year',
    'is_published',
    'published_at',
])]
class Book extends Model implements HasMedia
{
    use InteractsWithMedia;

    public const string COLLECTION_COVER = 'cover';

    protected function casts(): array
    {
        return [
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'price' => 'integer',
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection(self::COLLECTION_COVER)->singleFile();
    }

    /** Apakah buku ini sudah memakai cover ber-ISBN (bukan cover sementara). */
    public function hasIsbn(): bool
    {
        return filled($this->isbn);
    }

    public function coverUrl(): ?string
    {
        $media = $this->getFirstMedia(self::COLLECTION_COVER);
        return $media?->getUrl();
    }
}

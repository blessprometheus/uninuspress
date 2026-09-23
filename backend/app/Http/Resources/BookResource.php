<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Book
 */
class BookResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'author' => $this->author,
            'year' => $this->year,
            'category' => $this->category,
            'cover_url' => $this->coverUrl(),
            'price' => $this->price,
            'synopsis' => $this->synopsis,
            'isbn' => $this->isbn,
            'is_published' => $this->is_published,
            'submission_id' => $this->submission_id,
            'published_at' => $this->published_at?->toISOString(),
        ];
    }
}

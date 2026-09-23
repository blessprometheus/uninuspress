<?php

namespace App\Http\Resources;

use App\Models\Submission;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Submission
 */
class SubmissionResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'author_name' => $this->author_name,
            'synopsis' => $this->synopsis,
            'category' => $this->category,
            'va_number' => $this->va_number,
            'current_stage' => $this->current_stage,
            'current_status' => $this->current_status,
            'submitted_at' => $this->submitted_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),

            'author' => $this->whenLoaded('author', fn () => [
                'id' => $this->author->id,
                'name' => $this->author->name,
                'email' => $this->author->email,
            ]),

            'executor' => $this->whenLoaded('executor', fn () => $this->executor ? [
                'id' => $this->executor->id,
                'name' => $this->executor->name,
                'email' => $this->executor->email,
            ] : null),

            'documents' => $this->when($this->relationLoaded('media'), fn () => [
                'synopsis' => $this->documentVersions(Submission::COLLECTION_SYNOPSIS)->map(fn ($m) => $this->mediaResource($m)),
                'manuscript' => $this->documentVersions(Submission::COLLECTION_MANUSCRIPT)->map(fn ($m) => $this->mediaResource($m)),
                'cover_front' => $this->documentVersions(Submission::COLLECTION_COVER_FRONT)->map(fn ($m) => $this->mediaResource($m)),
                'cover_back' => $this->documentVersions(Submission::COLLECTION_COVER_BACK)->map(fn ($m) => $this->mediaResource($m)),
                'payment_receipt' => $this->documentVersions(Submission::COLLECTION_PAYMENT_RECEIPT)->map(fn ($m) => $this->mediaResource($m)),
                'plagiarism_check' => $this->documentVersions(Submission::COLLECTION_PLAGIARISM)->map(fn ($m) => $this->mediaResource($m)),
                'layout_pdf' => $this->documentVersions(\App\Models\Submission::COLLECTION_LAYOUT_PDF)->map(fn ($m) => $this->mediaResource($m)),
                'final_word' => $this->documentVersions(\App\Models\Submission::COLLECTION_FINAL_WORD)->map(fn ($m) => $this->mediaResource($m)),
                'perpusnas_result_pdf' => $this->documentVersions(\App\Models\Submission::COLLECTION_PERPUSNAS_RESULT)->map(fn ($m) => $this->mediaResource($m)),
                'submission_receipt' => $this->documentVersions(Submission::COLLECTION_SUBMISSION_RECEIPT)->map(fn ($m) => $this->mediaResource($m)),
            ]),

            'history' => SubmissionHistoryResource::collection(
                $this->whenLoaded('history')
            ),
        ];
    }

    private function mediaResource(\Spatie\MediaLibrary\MediaCollections\Models\Media $media): array
    {
        return [
            'id' => $media->id,
            'file_name' => $media->file_name,
            'name' => $media->name,
            'size' => $media->size,
            'mime_type' => $media->mime_type,
            'collection_name' => $media->collection_name,
            'created_at' => $media->created_at->toISOString(),
        ];
    }
}
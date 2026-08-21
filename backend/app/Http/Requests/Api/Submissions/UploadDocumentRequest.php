<?php

namespace App\Http\Requests\Api\Submissions;

use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Batas di-enforce per koleksi di SubmissionService.
        return [
            'file' => ['required', 'file'],
            'collection' => [
                'required',
                'string',
                'in:'.implode(',', [
                    \App\Models\Submission::COLLECTION_SYNOPSIS,
                    \App\Models\Submission::COLLECTION_MANUSCRIPT,
                    \App\Models\Submission::COLLECTION_COVER_FRONT,
                    \App\Models\Submission::COLLECTION_COVER_BACK,
                    \App\Models\Submission::COLLECTION_PAYMENT_RECEIPT,
                    \App\Models\Submission::COLLECTION_PLAGIARISM,
                ]),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'collection.in' => 'Jenis dokumen tidak valid.',
            'file.required' => 'File wajib diunggah.',
        ];
    }
}
<?php

namespace App\Http\Requests\Api\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PerpusnasUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:pdf', 'max:51200'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'Hasil Perpusnas harus berformat PDF.',
            'file.max' => 'Ukuran file maksimal 50MB.',
        ];
    }
}
<?php

namespace App\Http\Requests\Api\Executors;

use Illuminate\Foundation\Http\FormRequest;

class ExecutorUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file'],
            'collection' => ['required', 'string', 'in:layout_pdf,final_word'],
        ];
    }
}
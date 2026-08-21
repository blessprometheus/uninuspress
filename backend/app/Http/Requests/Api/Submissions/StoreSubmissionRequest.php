<?php

namespace App\Http\Requests\Api\Submissions;

use App\Models\Submission;
use Illuminate\Foundation\Http\FormRequest;

class StoreSubmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'synopsis' => ['nullable', 'string', 'max:5000'],
            'category' => ['nullable', 'string', 'max:50'],
        ];
    }
}
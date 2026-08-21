<?php

namespace App\Http\Requests\Api\Executors;

use Illuminate\Foundation\Http\FormRequest;

class ExecutorActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
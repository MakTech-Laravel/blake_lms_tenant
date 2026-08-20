<?php

namespace App\Http\Requests\Billing;

use Illuminate\Foundation\Http\FormRequest;

class PlatformRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'payment_intent' => ['required', 'string', 'max:255'],
            'amount' => ['nullable', 'integer', 'min:1'],
        ];
    }
}

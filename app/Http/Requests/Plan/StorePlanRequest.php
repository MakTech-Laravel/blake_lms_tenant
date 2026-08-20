<?php

namespace App\Http\Requests\Plan;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StorePlanRequest extends FormRequest
{
    use PlanRules;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Derive the slug from the name when one was not supplied.
     */
    protected function prepareForValidation(): void
    {
        if (blank($this->input('slug')) && filled($this->input('name'))) {
            $this->merge(['slug' => Str::slug((string) $this->input('name'))]);
        }

        $this->normalizePricing();
        $this->normalizeFeatures();
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...$this->planRules(),
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                // Archived plans keep their slug, so uniqueness spans them too.
                Rule::unique('plans', 'slug'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->planMessages();
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return $this->planAttributes();
    }
}

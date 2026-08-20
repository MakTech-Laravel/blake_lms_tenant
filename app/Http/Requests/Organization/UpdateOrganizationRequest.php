<?php

namespace App\Http\Requests\Organization;

use App\Enums\SchoolStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UpdateOrganizationRequest extends FormRequest
{
    use SubscriptionRules;

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
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('schools', 'slug')->ignore($this->route('organization')->id),
            ],
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'status' => ['required', new Enum(SchoolStatus::class)],
            ...$this->subscriptionRules(),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.unique' => 'An organization with that slug already exists.',
            'slug.regex' => 'The slug may only contain lowercase letters, numbers, and single hyphens.',
            ...$this->subscriptionMessages(),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return $this->subscriptionAttributes();
    }
}

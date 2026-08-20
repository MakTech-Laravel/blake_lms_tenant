<?php

namespace App\Http\Requests\Notification;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNotificationRequest extends FormRequest
{
    use NotificationRules;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->normalizeAudience();
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return $this->notificationRules();
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->notificationMessages();
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return $this->notificationAttributes();
    }
}

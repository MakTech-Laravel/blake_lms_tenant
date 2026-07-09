<?php

namespace App\Http\Requests\School;

use App\Support\SuperAdmin;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $schoolId = $this->route('school')->id;

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'avatar' => 'nullable|image|max:2048',
            'remove_avatar' => 'nullable|boolean',
            'roles' => 'nullable|array',
            // Isolation: only this school's own roles may be assigned.
            'roles.*' => [
                'string',
                Rule::exists('roles', 'name')->where('school_id', $schoolId),
            ],
        ];
    }

    /**
     * Only a school super-admin may grant the super-admin role. `isSuperAdmin()`
     * is evaluated in the active team context, so this is scoped to this school.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $roles = (array) $this->input('roles', []);

            if (SuperAdmin::isGrantedBy($roles) && ! $this->user()->isSuperAdmin()) {
                $validator->errors()->add(
                    'roles',
                    'Only a super administrator can assign the super-admin role.'
                );
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => 'The email address has already been taken.',
            'roles.*.exists' => 'One of the selected roles is invalid.',
        ];
    }
}

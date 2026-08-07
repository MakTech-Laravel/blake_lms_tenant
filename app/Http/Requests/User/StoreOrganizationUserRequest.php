<?php

namespace App\Http\Requests\User;

use App\Enums\UserType;
use App\Support\SuperAdmin;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreOrganizationUserRequest extends FormRequest
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
        $schoolId = (int) $this->input('school_id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'school_id' => ['required', 'integer', 'exists:schools,id'],
            'branch_id' => [
                'nullable',
                'integer',
                Rule::exists('branches', 'id')->where('school_id', $schoolId),
            ],
            'roles' => ['required', 'array', 'min:1', 'max:1'],
            'roles.*' => [
                'string',
                Rule::exists('roles', 'name')->where('school_id', $schoolId),
            ],
        ];
    }

    /**
     * Only a platform or school super-admin may grant the school super-admin role.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $roles = (array) $this->input('roles', []);

            if (! SuperAdmin::isGrantedBy($roles)) {
                return;
            }

            $actor = $this->user();

            if ($actor->type === UserType::PLATFORM) {
                if (! $actor->isSuperAdmin()) {
                    $validator->errors()->add(
                        'roles',
                        'Only a platform super administrator can assign the school super-admin role.'
                    );
                }

                return;
            }

            if (! $actor->isSuperAdmin()) {
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
    public function attributes(): array
    {
        return [
            'name' => 'Full name',
            'email' => 'Email',
            'password' => 'Password',
            'school_id' => 'Organization',
            'branch_id' => 'Location',
            'roles' => 'Role',
        ];
    }
}

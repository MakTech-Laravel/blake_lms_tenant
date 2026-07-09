<?php

namespace App\Http\Requests\School;

use App\Enums\PermissionDomain;
use App\Enums\RoleEnum;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:255',
                // Names are unique within this school's own roles.
                Rule::unique('roles', 'name')->where('school_id', $schoolId),
                Rule::notIn([RoleEnum::SUPER_ADMIN->value]),
            ],
            'permissions' => 'nullable|array',
            // Isolation: only school-domain permissions may be assigned.
            'permissions.*' => [
                'string',
                Rule::exists('permissions', 'name')
                    ->where('domain', PermissionDomain::SCHOOL->value),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The role name is required.',
            'name.unique' => 'A role with this name already exists in this school.',
            'name.not_in' => 'This role name is reserved.',
            'permissions.*.exists' => 'One of the selected permissions is invalid.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'Role name',
            'permissions' => 'Permissions',
        ];
    }
}

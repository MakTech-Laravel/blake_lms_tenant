<?php

namespace App\Http\Requests\Role;

use App\Enums\PermissionDomain;
use App\Enums\RoleEnum;
use App\Support\PlatformTeamResolver;
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
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                // Keep names unique among the platform's own roles.
                Rule::unique('roles', 'name')->where('school_id', PlatformTeamResolver::PLATFORM_TEAM_ID),
                Rule::notIn([RoleEnum::SUPER_ADMIN->value]),
            ],
            'permissions' => 'nullable|array',
            // Isolation: only platform-domain permissions may be assigned.
            'permissions.*' => [
                'string',
                Rule::exists('permissions', 'name')
                    ->where('domain', PermissionDomain::PLATFORM->value),
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
            'name.unique' => 'A role with this name already exists.',
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

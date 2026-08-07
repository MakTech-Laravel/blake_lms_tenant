<?php

namespace App\Http\Requests\User;

use App\Models\User;
use App\Support\PlatformTeamResolver;
use App\Support\SuperAdmin;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
{
    /**
     * Only a super-admin may modify a super-admin account (UserPolicy::update).
     * Runs before validation, so the super-admin invariants below are only
     * evaluated once the actor is allowed to touch this account at all.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$this->route('user')->id,
            'password' => 'nullable|min:8',
            'avatar' => 'nullable|image|max:2048',
            'remove_avatar' => 'nullable|boolean',
            'roles' => 'nullable|array',
            // Isolation: only the platform's own roles may be assigned, never a
            // tenant's identically-named team-scoped role.
            'roles.*' => [
                'string',
                Rule::exists('roles', 'name')
                    ->where('school_id', PlatformTeamResolver::PLATFORM_TEAM_ID),
            ],
        ];
    }

    /**
     * Enforce the super-admin invariants:
     *   - only a super-admin may grant the super-admin role;
     *   - the last super-admin cannot have the role removed.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $roles = (array) $this->input('roles', []);

            /** @var User $target */
            $target = $this->route('user');

            if (SuperAdmin::isGrantedBy($roles)
                && ! $target->isSuperAdmin()
                && ! $this->user()->isSuperAdmin()) {
                $validator->errors()->add(
                    'roles',
                    'Only a super administrator can assign the super-admin role.'
                );
            }

            if ($target->isSuperAdmin()
                && ! SuperAdmin::isGrantedBy($roles)
                && SuperAdmin::isLast($target)) {
                $validator->errors()->add(
                    'roles',
                    'You must assign the super-admin role to another user before removing it from the last super administrator.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
            'name.string' => 'The name field must be a string.',
            'name.max' => 'The name field must be less than 255 characters.',
            'email.required' => 'The email field is required.',
            'email.email' => 'The email field must be a valid email address.',
            'email.unique' => 'The email address has already been taken.',
            'password.required' => 'The password field is required.',
            'password.min' => 'The password field must be at least 8 characters long.',
            'avatar.image' => 'The avatar field must be an image.',
            'avatar.mimes' => 'The avatar field must be an image.',
            'avatar.max' => 'The avatar field must be less than 2048 kilobytes.',
            'roles.*.exists' => 'One of the selected roles is invalid.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'Name',
            'email' => 'Email',
            'password' => 'Password',
            'avatar' => 'Avatar',
            'roles' => 'Roles',
        ];
    }
}

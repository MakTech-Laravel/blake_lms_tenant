<?php

namespace App\Http\Requests\School;

use App\Models\User;
use App\Support\SuperAdmin;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateUserRequest extends FormRequest
{
    /**
     * Only a super-admin may modify a super-admin account (UserPolicy::update),
     * evaluated in this school's team context.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $schoolId = $this->route('school')->id;

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$this->route('user')->id,
            'password' => 'nullable|min:8',
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
     * Enforce the school super-admin invariants (team-scoped):
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

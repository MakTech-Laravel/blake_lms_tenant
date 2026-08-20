import { Head, Link, useForm, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import FileUpload from '@/components/file-upload';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInitials } from '@/hooks/use-initials';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import { avatarUrl } from '@/types/admin';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const getInitials = useInitials();

    const form = useForm(ProfileController.update(), {
        name: auth.user.name,
        email: auth.user.email,
        avatar: null as File | null,
        remove_avatar: false as boolean,
    });

    const existingAvatar =
        auth.user.avatar && !form.data.avatar && !form.data.remove_avatar
            ? [
                  {
                      id: 'current',
                      path: String(auth.user.avatar),
                      url:
                          (typeof auth.user.avatar_url === 'string'
                              ? auth.user.avatar_url
                              : null) ??
                          avatarUrl(String(auth.user.avatar)) ??
                          '',
                      mime_type: 'image/*',
                  },
              ]
            : [];

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.submit({
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.setData('avatar', null);
                form.setData('remove_avatar', false);
            },
        });
    };

    return (
        <>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <Card className="border-navy-50 bg-white p-6 shadow-sm">
                <div className="mb-6 border-b border-navy-50 pb-5">
                    <h2 className="text-h6 font-semibold text-navy-500">
                        Profile information
                    </h2>
                    <p className="mt-1 text-body-2 text-aqua-600">
                        Update your photo, name, and email address
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label>Profile photo</Label>
                        <FileUpload
                            variant="avatar"
                            avatarSize={112}
                            avatarFallback={
                                <span className="text-h6 font-semibold text-navy-400">
                                    {getInitials(auth.user.name)}
                                </span>
                            }
                            accept="image/png,image/jpeg,image/webp"
                            maxSize={2}
                            value={form.data.avatar}
                            onChange={(file) => {
                                form.setData(
                                    'avatar',
                                    (file as File | null) ?? null,
                                );
                                form.setData('remove_avatar', false);
                            }}
                            existingFiles={existingAvatar}
                            onRemoveExisting={() =>
                                form.setData('remove_avatar', true)
                            }
                            placeholder="Upload photo"
                            hint="PNG, JPG or WEBP · max 2 MB"
                            error={form.errors.avatar}
                        />
                    </div>

                    <div className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full name</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                                autoComplete="name"
                                placeholder="Full name"
                                className="border-navy-50"
                            />
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData('email', e.target.value)
                                }
                                required
                                autoComplete="username"
                                placeholder="Email address"
                                className="border-navy-50"
                            />
                            <InputError message={form.errors.email} />
                        </div>
                    </div>

                    {mustVerifyEmail &&
                        auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-sm text-aqua-600">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={send()}
                                        as="button"
                                        className="font-medium text-navy-500 underline decoration-navy-100 underline-offset-4 transition-colors hover:decoration-navy-500"
                                    >
                                        Click here to resend the verification
                                        email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to
                                        your email address.
                                    </div>
                                )}
                            </div>
                        )}

                    <div className="flex items-center justify-end gap-3 border-t border-navy-50 pt-5">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            data-test="update-profile-button"
                            className="bg-navy-500 text-white hover:bg-navy-400"
                        >
                            Save changes
                        </Button>
                    </div>
                </form>
            </Card>

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};

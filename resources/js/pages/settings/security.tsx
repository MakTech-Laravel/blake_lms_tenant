import { Form, Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { edit } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    passwordRules: string;
};

export default function Security({
    canManageTwoFactor = false,
    requiresConfirmation = false,
    twoFactorEnabled = false,
    passwordRules,
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    return (
        <>
            <Head title="Security settings" />

            <h1 className="sr-only">Security settings</h1>

            <Card
                className={
                    canManageTwoFactor
                        ? 'border-navy-50 bg-white p-6 shadow-sm'
                        : 'border-navy-50 bg-white p-6 shadow-sm lg:col-span-2'
                }
            >
                <div className="mb-6 border-b border-navy-50 pb-5">
                    <h2 className="text-h6 font-semibold text-navy-500">
                        Update password
                    </h2>
                    <p className="mt-1 text-body-2 text-aqua-600">
                        Use a long, unique password to keep your account secure
                    </p>
                </div>

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(formErrors) => {
                        if (formErrors.password) {
                            passwordInput.current?.focus();
                        }

                        if (formErrors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-5"
                >
                    {({ errors: formErrors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">
                                    Current password
                                </Label>
                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="border-navy-50"
                                    autoComplete="current-password"
                                    placeholder="Current password"
                                />
                                <InputError
                                    message={formErrors.current_password}
                                />
                            </div>

                            <div className="grid gap-5">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        New password
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className="border-navy-50"
                                        autoComplete="new-password"
                                        placeholder="New password"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError message={formErrors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        Confirm password
                                    </Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="border-navy-50"
                                        autoComplete="new-password"
                                        placeholder="Confirm password"
                                        passwordrules={passwordRules}
                                    />
                                    <InputError
                                        message={
                                            formErrors.password_confirmation
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-navy-50 pt-5">
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                    className="bg-navy-500 text-white hover:bg-navy-400"
                                >
                                    Save password
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </Card>

            {canManageTwoFactor && (
                <Card className="border-navy-50 bg-white p-6 shadow-sm">
                    <div className="mb-6 border-b border-navy-50 pb-5">
                        <h2 className="text-h6 font-semibold text-navy-500">
                            Two-factor authentication
                        </h2>
                        <p className="mt-1 text-body-2 text-aqua-600">
                            Add an extra layer of security with an authenticator
                            app
                        </p>
                    </div>

                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start gap-4">
                            <p className="text-sm text-navy-400">
                                You will be prompted for a secure pin during
                                login, which you can retrieve from the
                                TOTP-supported application on your phone.
                            </p>

                            <Form {...disable.form()}>
                                {({ processing }) => (
                                    <Button
                                        variant="destructive"
                                        type="submit"
                                        disabled={processing}
                                    >
                                        Disable 2FA
                                    </Button>
                                )}
                            </Form>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-start gap-4">
                            <p className="text-sm text-navy-400">
                                When you enable two-factor authentication, you
                                will be prompted for a secure pin during login.
                                This pin can be retrieved from a TOTP-supported
                                application on your phone.
                            </p>

                            {hasSetupData ? (
                                <Button
                                    onClick={() => setShowSetupModal(true)}
                                    className="bg-navy-500 text-white hover:bg-navy-400"
                                >
                                    <ShieldCheck />
                                    Continue setup
                                </Button>
                            ) : (
                                <Form
                                    {...enable.form()}
                                    onSuccess={() => setShowSetupModal(true)}
                                >
                                    {({ processing }) => (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-navy-500 text-white hover:bg-navy-400"
                                        >
                                            Enable 2FA
                                        </Button>
                                    )}
                                </Form>
                            )}
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </Card>
            )}
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};

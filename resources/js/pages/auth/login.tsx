import { Form, Head, Link } from '@inertiajs/react';
import {
    Building2,
    BriefcaseBusiness,
    Lock,
    Mail,
    Users,
    UserRound,
} from 'lucide-react';
import InputError from '@/components/input-error';
import { AquaCertLogo } from '@/components/landing/aqua-cert-logo';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { loginBrand } from '@/data/landing';
import { home } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

const statIcons = [Building2, UserRound, Users, BriefcaseBusiness];

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Sign in" />

            <div className="grid min-h-svh bg-white lg:grid-cols-2">
                <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-b from-navy-50 via-navy-400 to-navy-900 p-10 text-white lg:flex">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(10,177,185,0.25)_0%,_transparent_50%)]" />

                    <Link href={home()} className="relative z-10">
                        <AquaCertLogo variant="split" className="text-h5" />
                    </Link>

                    <div className="relative z-10 max-w-md">
                        <h1 className="text-h3 font-bold text-balance text-white">
                            {loginBrand.headline}
                        </h1>
                        <p className="mt-4 text-body-2 text-navy-100">
                            {loginBrand.description}
                        </p>

                        <ul className="mt-10 space-y-4">
                            {loginBrand.stats.map((stat, index) => {
                                const Icon = statIcons[index] ?? Building2;

                                return (
                                    <li
                                        key={stat.label}
                                        className="flex items-center gap-3 text-label-1 text-white"
                                    >
                                        <span className="flex size-9 items-center justify-center rounded-md bg-white/10 text-aqua-300">
                                            <Icon className="size-4" />
                                        </span>
                                        {stat.label}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="relative z-10 flex items-center justify-between text-label-3 text-aqua-300">
                        <p>{loginBrand.copyright}</p>
                        <div className="flex gap-4">
                            {loginBrand.links.map((item) => (
                                <span key={item}>{item}</span>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
                    <div className="mx-auto w-full max-w-md">
                        <Link
                            href={home()}
                            className="mb-10 inline-flex lg:hidden"
                        >
                            <AquaCertLogo />
                        </Link>

                        <div className="space-y-2">
                            <h1 className="text-h4 font-bold text-navy-500">
                                Welcome back
                            </h1>
                            <p className="text-body-2 text-navy-300">
                                Sign in to access your platform dashboard.
                            </p>
                        </div>

                        {status && (
                            <div className="mt-4 text-body-3 font-medium text-emerald-600">
                                {status}
                            </div>
                        )}

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="mt-8 flex flex-col gap-6"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-200" />
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="owner@aquacert.io"
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-navy-200" />
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="password"
                                                className="pl-10"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <Label htmlFor="remember">
                                                Remember me
                                            </Label>
                                        </div>
                                        {canResetPassword && (
                                            <TextLink
                                                href={request()}
                                                className="text-label-2 text-navy-300"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-navy-500 text-white hover:bg-navy-600"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner />}
                                        Sign In
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>
                </main>
            </div>
        </>
    );
}

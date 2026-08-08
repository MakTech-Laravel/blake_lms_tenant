import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { AquaCertLogo } from '@/components/landing/aqua-cert-logo';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { navLinks } from '@/data/landing';
import { dashboard, login } from '@/routes';

export function LandingNav() {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-navy-50/80 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <a href="#top" className="shrink-0">
                    <AquaCertLogo />
                </a>

                <nav className="hidden items-center gap-8 md:flex">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-label-2 font-medium text-navy-400 transition-colors hover:text-navy-500"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden md:block">
                    {auth.user ? (
                        <Button
                            asChild
                            className="bg-navy-500 text-white hover:bg-navy-600"
                        >
                            <Link href={dashboard()}>Dashboard</Link>
                        </Button>
                    ) : (
                        <Button
                            asChild
                            className="bg-navy-500 text-white hover:bg-navy-600"
                        >
                            <Link href={login()}>Launch Login</Link>
                        </Button>
                    )}
                </div>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px]">
                        <SheetHeader>
                            <SheetTitle>
                                <AquaCertLogo />
                            </SheetTitle>
                        </SheetHeader>
                        <nav className="mt-6 flex flex-col gap-4 px-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="text-label-1 font-medium text-navy-500"
                                    onClick={() => setOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                            {auth.user ? (
                                <Button
                                    asChild
                                    className="mt-2 bg-navy-500 text-white hover:bg-navy-600"
                                >
                                    <Link href={dashboard()}>Dashboard</Link>
                                </Button>
                            ) : (
                                <Button
                                    asChild
                                    className="mt-2 bg-navy-500 text-white hover:bg-navy-600"
                                >
                                    <Link href={login()}>Launch Login</Link>
                                </Button>
                            )}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}

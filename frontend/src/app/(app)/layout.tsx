"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, TrendingUp, Users, AlertTriangle, Scan } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard, color: "taupe-dark" },
    { label: "Quick Scan", href: "/quick-scan", icon: Scan, color: "teal" },
    { label: "Inventario", href: "/stock", icon: Package, color: "teal" },
    { label: "Movimenti", href: "/movements", icon: TrendingUp, color: "sage" },
    { label: "Fornitori", href: "/suppliers", icon: Users, color: "taupe" },
    { label: "Stock critici", href: "/critical", icon: AlertTriangle, color: "brick" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-8">
                <div className="flex items-center gap-3">
                    <button
                        aria-label="Apri/chiudi menu"
                        onClick={() => setSidebarOpen((value) => !value)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:border-primary/60 hover:text-primary-foreground"
                    >
                        <span className="space-y-1">
                            <span className="block h-0.5 w-5 bg-current" />
                            <span className="block h-0.5 w-4 bg-current" />
                            <span className="block h-0.5 w-6 bg-current" />
                        </span>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground">Enò · Etna OPS</span>
                        <span className="font-display text-lg leading-tight">Gestione Enoteca</span>
                    </div>
                </div>
                <div className="flex flex-1 items-center justify-end gap-3">
                    <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground sm:flex">
                        <span className="text-xs font-semibold text-primary-foreground">⌘K</span>
                        <input
                            aria-label="Cerca vino, annata, fornitore"
                            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                            placeholder="Cerca vino, annata, fornitore, movimento..."
                        />
                    </div>
                    <div className="relative group">
                        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/10">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary-foreground">
                                <span className="text-sm font-bold">DU</span>
                            </div>
                            <span className="hidden sm:inline">Dev User</span>
                        </button>
                        <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-lg border border-border bg-card shadow-lg group-hover:block">
                            <div className="p-2">
                                <div className="px-3 py-2 text-xs text-muted-foreground">dev@example.com</div>
                                <hr className="my-2 border-border" />
                                <Link
                                    href="/settings"
                                    className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-primary/10"
                                >
                                    Impostazioni
                                </Link>
                                <Link
                                    href="/api/v1/auth/login"
                                    className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-primary/10"
                                >
                                    Login
                                </Link>
                                <button
                                    onClick={() => window.location.href = '/api/v1/auth/logout'}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid min-h-[calc(100vh-72px)] grid-cols-[auto,1fr]">
                <aside
                    className={cn(
                        "hidden h-full flex-col border-r border-border bg-card px-3 py-6 transition-all duration-200 sm:flex",
                        sidebarOpen ? "w-60" : "w-16"
                    )}
                >
                    <div className="mb-6 ml-1 text-xs uppercase tracking-wide text-muted-foreground">Navigazione</div>
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary/50 hover:bg-primary/10",
                                        isActive && "border-primary/50 bg-primary/10"
                                    )}
                                >
                                    <span className={cn(
                                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white transition",
                                        item.color === "taupe-dark" && "bg-earth-taupe-dark group-hover:bg-earth-taupe",
                                        item.color === "teal" && "bg-earth-teal group-hover:opacity-90",
                                        item.color === "sage" && "bg-earth-sage group-hover:opacity-90",
                                        item.color === "taupe" && "bg-earth-taupe group-hover:opacity-90",
                                        item.color === "brick" && "bg-earth-brick group-hover:opacity-90"
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="mt-auto rounded-xl border border-accent/30 bg-accent/10 px-3 py-3 text-xs text-muted-foreground">
                        Palette vino + ambra · dati live
                    </div>
                </aside>

                <main className="relative">
                    {children}
                </main>
            </div>
        </div>
    );
}

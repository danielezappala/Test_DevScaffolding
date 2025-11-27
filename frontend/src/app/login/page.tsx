"use client";

import { useState } from "react";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        setIsLoading(true);
        // Redirect to backend Google login endpoint
        // Use relative path for browser to ensure it goes through Traefik correctly
        const apiUrl = "/test-devscaffolding/api/v1";
        window.location.href = `${apiUrl}/auth/login`;
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        Accedi a Enò <span className="text-xs text-red-500">(DEBUG V2)</span>
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Gestionale magazzino vini Etna
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm">
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span className="mr-2">Reindirizzamento...</span>
                            ) : (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg
                                        className="h-5 w-5 text-primary-foreground group-hover:text-primary-foreground"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                    </svg>
                                </span>
                            )}
                            Accedi con Google
                        </button>
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                        <p>Accesso riservato al personale autorizzato.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

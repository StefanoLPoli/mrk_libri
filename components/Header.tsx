// components/Header.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

export default function Header() {
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="border-b border-lightgray bg-white">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold text-black hover:text-darkgray">
                    LIBRARY MARKET
                </Link>
                
                <nav className="flex gap-6 items-center">
                    <Link href="/" className="text-darkgray hover:text-black transition-colors">
                        Home
                    </Link>
                    <Link href="/compra" className="text-darkgray hover:text-black transition-colors">
                        Compra
                    </Link>
                    <Link href="/vendi" className="text-darkgray hover:text-black transition-colors font-medium">
                        Vendi
                    </Link>
                    
                    {status === 'loading' ? (
                        <div className="w-8 h-8 rounded-full bg-lightgray animate-pulse"></div>
                    ) : session ? (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 border border-lightgray px-3 py-2 hover:bg-offwhite transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                                    {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                                </div>
                                <span className="text-sm hidden md:inline">
                                    {session.user?.name || session.user?.email}
                                </span>
                            </button>
                            
                            {menuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-lightgray shadow-medium z-50">
                                    <div className="p-3 border-b border-lightgray">
                                        <p className="text-sm font-medium">{session.user?.name}</p>
                                        <p className="text-xs text-midgray">{session.user?.email}</p>
                                    </div>
                                    <Link
                                        href="/profilo"
                                        className="block px-4 py-2 text-sm hover:bg-offwhite transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Il mio profilo
                                    </Link>
                                    <Link
                                        href="/user/annunci"
                                        className="block px-4 py-2 text-sm hover:bg-offwhite transition-colors"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        I miei annunci
                                    </Link>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-offwhite transition-colors border-t border-lightgray"
                                    >
                                        Esci
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                        >
                            Accedi / Registrati
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
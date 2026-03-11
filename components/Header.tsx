// components/Header.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/compra?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="border-b border-lightgray bg-white">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-black hover:text-darkgray">
                        LIBRARY MARKET
                    </Link>

                    {/* Barra di ricerca */}
                    <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md mx-4">
                        <div className="flex">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cerca libro..."
                                className="flex-1 px-4 py-2 text-sm border border-r-0 border-gray-300 focus:outline-none focus:border-black"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors border border-black"
                            >
                                Cerca
                            </button>
                            {/* Icona ricerca mobile */}
                            <button 
                                onClick={() => router.push('/compra')}
                                className="md:hidden p-2"
                            >
                                🔍
                            </button>
                        </div>
                    </form>
                    
                    <nav className="flex gap-6 items-center">
                        <Link 
                            href="/vendi" 
                            className="border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors text-sm"
                        >
                            + Vendi un libro
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
            </div>
        </header>
    );
}
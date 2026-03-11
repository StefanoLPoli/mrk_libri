// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Listing {
    id: string;
    price: number;
    condition: string;
    book: {
        title: string;
        author: string | null;
        coverUrl: string | null;
        publishedYear: number | null;
    };
    user: {
        name: string | null;
    };
}

export default function Home() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [recentListings, setRecentListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    // Carica gli ultimi annunci
    useEffect(() => {
        fetchRecentListings();
    }, []);

    const fetchRecentListings = async () => {
        try {
            const response = await fetch('/api/listings?limit=6');
            const data = await response.json();
            setRecentListings(data);
        } catch (error) {
            console.error('Errore:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/compra?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const getConditionLabel = (condition: string) => {
        const labels: Record<string, string> = {
            'COME_NUOVO': 'Come nuovo',
            'OTTIMO': 'Ottimo',
            'BUONO': 'Buono',
            'ACCETTABILE': 'Accettabile'
        };
        return labels[condition] || condition;
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            {/* Hero section con barra di ricerca - stile Amazon/Bookbot */}
            <div className="text-center py-16 bg-gradient-to-b from-white to-gray-50">
                <h1 className="text-5xl font-light mb-4 tracking-tight">
                    Libri usati,<br />nuove storie
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-lg">
                    Compra e vendi libri tra privati. Senza commissioni, senza complicazioni.
                </p>
            </div>

            {/* Ultimi annunci - stile Amazon */}
            <div className="mt-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-light">Ultimi arrivi</h2>
                    <Link href="/compra" className="text-sm text-black hover:underline">
                        Vedi tutti →
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-gray-200 aspect-[3/4] mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {recentListings.map((listing) => (
                            <Link 
                                key={listing.id}
                                href={`/compra/${listing.id}`}
                                className="group"
                            >
                                <div className="aspect-[3/4] bg-gray-100 mb-2 overflow-hidden">
                                    {listing.book.coverUrl ? (
                                        <img 
                                            src={listing.book.coverUrl} 
                                            alt={listing.book.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
                                            📚
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-medium text-sm truncate group-hover:text-black">
                                    {listing.book.title}
                                </h3>
                                <p className="text-xs text-gray-600 truncate">
                                    {listing.book.author || 'Autore sconosciuto'}
                                </p>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="font-bold text-sm">€{listing.price.toFixed(2)}</span>
                                    <span className="text-xs text-gray-500">
                                        {getConditionLabel(listing.condition).substring(0, 3)}...
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Sezioni categoria - stile Amazon */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/compra?categoria=narrativa" className="bg-gray-100 p-4 hover:bg-gray-200 transition-colors">
                    <span className="text-lg mb-2 block">📚</span>
                    <h3 className="font-medium">Narrativa</h3>
                    <p className="text-xs text-gray-600">Romanzi, racconti</p>
                </Link>
                <Link href="/compra?categoria=saggistica" className="bg-gray-100 p-4 hover:bg-gray-200 transition-colors">
                    <span className="text-lg mb-2 block">📖</span>
                    <h3 className="font-medium">Saggistica</h3>
                    <p className="text-xs text-gray-600">Storia, scienza</p>
                </Link>
                <Link href="/compra?categoria=scolastici" className="bg-gray-100 p-4 hover:bg-gray-200 transition-colors">
                    <span className="text-lg mb-2 block">🎓</span>
                    <h3 className="font-medium">Libri scolastici</h3>
                    <p className="text-xs text-gray-600">Testi universitari</p>
                </Link>
                <Link href="/compra?categoria=classici" className="bg-gray-100 p-4 hover:bg-gray-200 transition-colors">
                    <span className="text-lg mb-2 block">🏛️</span>
                    <h3 className="font-medium">Classici</h3>
                    <p className="text-xs text-gray-600">Grandi opere</p>
                </Link>
            </div>

            {/* Come funziona (in versione ridotta) */}
            <div className="mt-16 border-t border-gray-200 pt-12">
                <h2 className="text-2xl font-light mb-8 text-center">In tre semplici passi</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-4">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
                        <h3 className="font-medium mb-2">Cerca il libro</h3>
                        <p className="text-sm text-gray-600">Trova il libro che cerchi o che vuoi vendere</p>
                    </div>
                    <div className="p-4">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
                        <h3 className="font-medium mb-2">Contatta il venditore</h3>
                        <p className="text-sm text-gray-600">Mettiti d'accordo per lo scambio o la spedizione</p>
                    </div>
                    <div className="p-4">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
                        <h3 className="font-medium mb-2">Scambia il libro</h3>
                        <p className="text-sm text-gray-600">Dai una seconda vita ai libri, zero commissioni</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
// app/compra/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Listing {
    id: string;
    price: number;
    condition: string;
    description: string | null;
    createdAt: string;
    book: {
        title: string;
        author: string | null;
        coverUrl: string | null;
        publishedYear: number | null;
    };
    user: {
        name: string | null;
        email: string;
    };
}

export default function CompraPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        try {
            const response = await fetch('/api/listings');
            const data = await response.json();
            setListings(data);
        } catch (error) {
            console.error('Errore:', error);
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12 text-center">
                Caricamento annunci...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-light">Libri in vendita</h1>
                <Link 
                    href="/vendi" 
                    className="border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                >
                    + Vendi un libro
                </Link>
            </div>

            {listings.length === 0 ? (
                <div className="text-center py-12 border border-lightgray bg-offwhite">
                    <p className="text-midgray mb-4">Nessun annuncio al momento</p>
                    <Link 
                        href="/vendi" 
                        className="text-black underline"
                    >
                        Pubblica il primo annuncio
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <Link 
                            key={listing.id}
                            href={`/compra/${listing.id}`}  // ← Link alla pagina di dettaglio
                            className="block border border-lightgray p-4 hover:shadow-medium transition-shadow cursor-pointer"
                        >
                            <div className="flex gap-4">
                                {listing.book.coverUrl ? (
                                    <img 
                                        src={listing.book.coverUrl} 
                                        alt={listing.book.title}
                                        className="w-20 h-28 object-cover"
                                    />
                                ) : (
                                    <div className="w-20 h-28 bg-lightgray flex items-center justify-center text-midgray">
                                        📚
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="font-medium">{listing.book.title}</h3>
                                    <p className="text-sm text-darkgray">{listing.book.author}</p>
                                    <p className="text-xs text-midgray mt-1">
                                        {listing.book.publishedYear || 'Anno sconosciuto'}
                                    </p>
                                    <div className="mt-2">
                                        <span className="text-sm font-medium">€{listing.price.toFixed(2)}</span>
                                        <span className="text-xs text-midgray ml-2">
                                            {getConditionLabel(listing.condition)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-lightgray text-xs text-midgray flex justify-between items-center">
                                <span>Venduto da: {listing.user.name || listing.user.email}</span>
                                <span className="text-black text-sm">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
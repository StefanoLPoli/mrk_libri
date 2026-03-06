// app/user/annunci/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Listing {
    id: string;
    price: number;
    condition: string;
    description: string | null;
    status: string;
    createdAt: string;
    book: {
        title: string;
        author: string | null;
        coverUrl: string | null;
        publishedYear: number | null;
        isbn: string;
    };
}

export default function MieiAnnunciPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    // Proteggi la pagina
    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/auth/login?callbackUrl=/user/annunci');
        }
    }, [session, status, router]);

    // Carica gli annunci
    useEffect(() => {
        if (session) {
            fetchListings();
        }
    }, [session]);

    const fetchListings = async () => {
        try {
            const response = await fetch('/api/user/listings');
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

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'ATTIVO':
                return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Attivo</span>;
            case 'VENDUTO':
                return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Venduto</span>;
            case 'SOSPESO':
                return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Sospeso</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">{status}</span>;
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                Caricamento...
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-light mb-2">I miei annunci</h1>
                    <p className="text-midgray">
                        Gestisci tutti i libri che hai messo in vendita
                    </p>
                </div>
                <Link 
                    href="/vendi" 
                    className="border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
                >
                    + Nuovo annuncio
                </Link>
            </div>

            {listings.length === 0 ? (
                <div className="text-center py-12 border border-lightgray bg-offwhite">
                    <p className="text-midgray mb-4">Non hai ancora pubblicato annunci</p>
                    <Link 
                        href="/vendi" 
                        className="text-black underline"
                    >
                        Pubblica il tuo primo annuncio
                    </Link>
                </div>
            ) : (
                // Griglia 3 colonne
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <Link 
                            key={listing.id} 
                            href={`/user/annunci/${listing.id}`}
                            className="card-hover p-4 bg-white block cursor-pointer"
                        >
                            <div className="flex flex-col h-full">
                                {/* Copertina e info base */}
                                <div className="flex gap-4 mb-3">
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
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium truncate">{listing.book.title}</h3>
                                        <p className="text-sm text-darkgray truncate">{listing.book.author}</p>
                                        <p className="text-xs text-midgray mt-1">
                                            {listing.book.publishedYear || 'Anno sconosciuto'}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Prezzo e condizioni */}
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-lg">€{listing.price.toFixed(2)}</span>
                                    <span className="text-sm text-darkgray">
                                        {getConditionLabel(listing.condition)}
                                    </span>
                                </div>
                                
                                {/* Stato e data */}
                                <div className="flex justify-between items-center text-xs border-t border-lightgray pt-3">
                                    {getStatusBadge(listing.status)}
                                    <span className="text-midgray">
                                        {new Date(listing.createdAt).toLocaleDateString('it-IT')}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
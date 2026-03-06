// app/annunci/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import * as React from 'react';

interface Listing {
    id: string;
    price: number;
    condition: string;
    description: string | null;
    status: string;
    images: string | null; // Array di URL in JSON string
    createdAt: string;
    user: {
        id: string;
        name: string | null;
        email: string;
    };
    book: {
        id: string;
        isbn: string;
        title: string;
        author: string | null;
        publisher: string | null;
        publishedYear: number | null;
        pageCount: number | null;
        coverUrl: string | null;
        description: string | null;
    };
}

type PageProps = {
    params: Promise<{ id: string }>
}

export default function DettaglioPubblicoPage({ params }: PageProps) {
    const { id } = React.use(params);
    const { data: session } = useSession();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showContactInfo, setShowContactInfo] = useState(false);

    // Carica i dettagli dell'annuncio
    useEffect(() => {
        fetchListing();
    }, [id]);

    const fetchListing = async () => {
        try {
            const response = await fetch(`/api/listings/${id}`);
            const data = await response.json();
            setListing(data);
            
            // Parsing immagini
            if (data.images) {
                const images = JSON.parse(data.images);
                if (images.length > 0) {
                    setSelectedImage(images[0]);
                } else if (data.book.coverUrl) {
                    setSelectedImage(data.book.coverUrl);
                }
            } else if (data.book.coverUrl) {
                setSelectedImage(data.book.coverUrl);
            }
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

    // Recupera array immagini
    const getImages = (): string[] => {
        if (!listing) return [];
        
        const images: string[] = [];
        
        // Aggiungi foto caricate dall'utente
        if (listing.images) {
            try {
                const userImages = JSON.parse(listing.images);
                if (Array.isArray(userImages)) {
                    images.push(...userImages);
                }
            } catch (e) {
                console.error('Errore parsing immagini:', e);
            }
        }
        
        // Aggiungi copertina dal libro come fallback
        if (listing.book.coverUrl && images.length === 0) {
            images.push(listing.book.coverUrl);
        }
        
        return images;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="animate-pulse">
                    <p className="text-gray-400">Caricamento annuncio...</p>
                </div>
            </div>
        );
    }

    if (!listing || listing.status !== 'ATTIVO') {
        return (
            <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
                <h1 className="text-3xl font-light mb-4">Annuncio non disponibile</h1>
                <p className="text-gray-600 mb-8">
                    Questo annuncio non è più attivo o non esiste.
                </p>
                <Link 
                    href="/compra" 
                    className="inline-block bg-black text-white px-8 py-3 hover:bg-gray-800 transition-colors"
                >
                    Vedi altri libri in vendita
                </Link>
            </div>
        );
    }

    const images = getImages();

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link href="/" className="hover:text-black">Home</Link>
                <span>›</span>
                <Link href="/compra" className="hover:text-black">Compra</Link>
                <span>›</span>
                <span className="text-black truncate">{listing.book.title}</span>
            </div>

            {/* Layout principale a 2 colonne */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COLONNA SINISTRA - GALLERIA FOTO */}
                <div>
                    {/* Immagine principale */}
                    <div className="aspect-[3/4] bg-gray-100 mb-4 flex items-center justify-center border border-gray-200">
                        {selectedImage ? (
                            <img 
                                src={selectedImage} 
                                alt={listing.book.title}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="text-6xl text-gray-400">📚</div>
                        )}
                    </div>

                    {/* Thumbnail gallery */}
                    {images.length > 1 && (
                        <div className="grid grid-cols-5 gap-2">
                            {images.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(img)}
                                    className={`aspect-[3/4] border-2 overflow-hidden ${
                                        selectedImage === img 
                                            ? 'border-black' 
                                            : 'border-transparent hover:border-gray-300'
                                    }`}
                                >
                                    <img 
                                        src={img} 
                                        alt={`${listing.book.title} - foto ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Info aggiuntive libro */}
                    <div className="mt-8 p-6 bg-gray-50 border border-gray-200">
                        <h3 className="font-medium mb-3">Dettagli libro</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between">
                                <span className="text-gray-600">ISBN:</span>
                                <span className="font-mono">{listing.book.isbn}</span>
                            </li>
                            {listing.book.publisher && (
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Editore:</span>
                                    <span>{listing.book.publisher}</span>
                                </li>
                            )}
                            {listing.book.publishedYear && (
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Anno pubblicazione:</span>
                                    <span>{listing.book.publishedYear}</span>
                                </li>
                            )}
                            {listing.book.pageCount && (
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Pagine:</span>
                                    <span>{listing.book.pageCount}</span>
                                </li>
                            )}
                        </ul>
                        
                        {listing.book.description && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-700 line-clamp-4">
                                    {listing.book.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLONNA DESTRA - INFO VENDITA */}
                <div>
                    {/* Titolo e autore */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">{listing.book.title}</h1>
                        <p className="text-xl text-gray-600">di {listing.book.author || 'Autore sconosciuto'}</p>
                    </div>

                    {/* Prezzo e condizioni */}
                    <div className="mb-8 p-6 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-600">Prezzo</span>
                            <span className="text-3xl font-bold">€{listing.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Condizioni</span>
                            <span className="text-lg">{getConditionLabel(listing.condition)}</span>
                        </div>
                    </div>

                    {/* Descrizione venditore */}
                    {listing.description && (
                        <div className="mb-8">
                            <h3 className="font-medium mb-3">Descrizione del venditore</h3>
                            <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
                        </div>
                    )}

                    {/* Info venditore */}
                    <div className="mb-8 p-6 bg-gray-50 border border-gray-200">
                        <h3 className="font-medium mb-4">Informazioni sul venditore</h3>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-xl">
                                {listing.user.name?.[0]?.toUpperCase() || '👤'}
                            </div>
                            <div>
                                <p className="font-medium">{listing.user.name || 'Utente'}</p>
                                <p className="text-sm text-gray-600">Membro dal {new Date(listing.createdAt).toLocaleDateString('it-IT')}</p>
                            </div>
                        </div>

                        {/* Bottone contatta (da implementare con chat) */}
                        {!showContactInfo ? (
                            <button
                                onClick={() => setShowContactInfo(true)}
                                className="w-full bg-black text-white py-4 hover:bg-gray-800 transition-colors font-medium"
                            >
                                📱 Contatta il venditore
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-4 bg-white border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Email:</p>
                                    <p className="font-medium">{listing.user.email}</p>
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    Presto disponibile anche la chat integrata!
                                </p>
                                <button
                                    onClick={() => setShowContactInfo(false)}
                                    className="text-sm text-gray-500 underline"
                                >
                                    Nascondi contatti
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Azioni per il proprietario (se è il suo annuncio) */}
                    {session?.user?.id === listing.user.id && (
                        <div className="border border-gray-200 p-6">
                            <h3 className="font-medium mb-3">👋 Sei il venditore</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Questo è il tuo annuncio. Puoi gestirlo dalla tua area personale.
                            </p>
                            <Link
                                href={`/user/annunci/${listing.id}`}
                                className="inline-block w-full border border-black text-center px-4 py-3 hover:bg-black hover:text-white transition-colors"
                            >
                                Gestisci annuncio
                            </Link>
                        </div>
                    )}

                    {/* Link per tornare indietro */}
                    <div className="mt-6 text-center">
                        <Link 
                            href="/compra" 
                            className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1"
                        >
                            ← Continua a cercare libri
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
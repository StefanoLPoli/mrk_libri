// app/user/annunci/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as React from 'react';

interface Listing {
    id: string;
    price: number;
    condition: string;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string; 
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
  params: Promise<{ id: string }>  // ← Importante: è una Promise!
}

export default function DettaglioAnnuncioPage({ params }: PageProps) {
    const { id } = React.use(params);
    console.log('📌 ID dalla URL:', id);
    console.log('📌 URL completo:', window.location.href);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    
    // Stato per il form di modifica
    const [editForm, setEditForm] = useState({
        price: '',
        condition: '',
        description: '',
    });

    // Proteggi la pagina
    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push(`/auth/login?callbackUrl=/user/annunci/${id}`);
        }
    }, [session, status, router, id]);

    // Carica i dettagli dell'annuncio
    useEffect(() => {
        if (session) {
            fetchListing();
        }
    }, [session, id]);

    const fetchListing = async () => {
        try {
            const response = await fetch(`/api/listings/${id}`);
            const data = await response.json();
            setListing(data);
            setEditForm({
                price: data.price,
                condition: data.condition,
                description: data.description || '',
            });
        } catch (error) {
            console.error('Errore:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch(`/api/listings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });

            if (response.ok) {
                const updated = await response.json();
                setListing(updated);
                setIsEditing(false);
                alert('✅ Annuncio aggiornato');
            } else {
                alert('❌ Errore durante l\'aggiornamento');
            }
        } catch (error) {
            alert('❌ Errore durante l\'aggiornamento');
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        try {
            const response = await fetch(`/api/listings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const updated = await response.json();
                setListing(updated);
                alert(`✅ Annuncio ${newStatus === 'ATTIVO' ? 'riattivato' : newStatus === 'VENDUTO' ? 'contrassegnato come venduto' : 'sospeso'}`);
            } else {
                alert('❌ Errore durante l\'aggiornamento');
            }
        } catch (error) {
            alert('❌ Errore durante l\'aggiornamento');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Sei sicuro di voler eliminare questo annuncio? Questa azione è irreversibile.')) return;

        try {
            const response = await fetch(`/api/listings/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('✅ Annuncio eliminato');
                router.push('/user/annunci');
            } else {
                alert('❌ Errore durante l\'eliminazione');
            }
        } catch (error) {
            alert('❌ Errore durante l\'eliminazione');
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
                return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Attivo</span>;
            case 'VENDUTO':
                return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Venduto</span>;
            case 'SOSPESO':
                return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">Sospeso</span>;
            default:
                return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{status}</span>;
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                Caricamento...
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <p className="text-midgray mb-4">Annuncio non trovato</p>
                <Link href="/user/annunci" className="text-black underline">
                    Torna ai tuoi annunci
                </Link>
            </div>
        );
    }

    // Oppure più specifico: aspetta che anche book sia caricato
    if (!listing?.book) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                Caricamento dettagli libro...
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-midgray mb-6">
                <Link href="/user/annunci" className="hover:text-black">
                    I miei annunci
                </Link>
                <span>›</span>
                <span className="text-black">Dettaglio annuncio</span>
            </div>

            {/* Header con titolo e stato */}
            <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-light">Gestisci annuncio</h1>
                {getStatusBadge(listing.status)}
            </div>

            {/* Card principale */}
            <div className="border border-lightgray p-6 mb-6">
                {/* Info libro */}
                <div className="flex gap-6 mb-6">
                    {listing.book.coverUrl ? (
                        <img 
                            src={listing.book.coverUrl} 
                            alt={listing.book.title}
                            className="w-32 h-44 object-cover"
                        />
                    ) : (
                        <div className="w-32 h-44 bg-lightgray flex items-center justify-center text-midgray text-4xl">
                            📚
                        </div>
                    )}
                    
                    <div className="flex-1">
                        <h2 className="text-2xl font-medium mb-2">{listing.book.title}</h2>
                        <p className="text-darkgray mb-1">{listing.book.author}</p>
                        <p className="text-sm text-midgray">
                            {listing.book.publisher} • {listing.book.publishedYear || 'Anno sconosciuto'}
                        </p>
                        <p className="text-xs text-midgray mt-2">ISBN: {listing.book.isbn}</p>
                    </div>
                </div>

                {/* Form di modifica o visualizzazione */}
                {isEditing ? (
                    <div className="space-y-4 border-t border-lightgray pt-4">
                        <h3 className="font-medium mb-3">Modifica annuncio</h3>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Prezzo (€)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={editForm.price}
                                onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                className="w-full p-3 border border-lightgray bg-white focus:outline-none focus:border-black"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Condizioni</label>
                            <select
                                value={editForm.condition}
                                onChange={(e) => setEditForm({...editForm, condition: e.target.value})}
                                className="w-full p-3 border border-lightgray bg-white focus:outline-none focus:border-black"
                            >
                                <option value="COME_NUOVO">Come nuovo</option>
                                <option value="OTTIMO">Ottimo</option>
                                <option value="BUONO">Buono</option>
                                <option value="ACCETTABILE">Accettabile</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Descrizione</label>
                            <textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                rows={4}
                                className="w-full p-3 border border-lightgray bg-white focus:outline-none focus:border-black"
                            />
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleUpdate}
                                className="bg-black text-white px-6 py-2 hover:bg-darkgray transition-colors"
                            >
                                Salva modifiche
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors"
                            >
                                Annulla
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="border-t border-lightgray pt-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-midgray">Prezzo</p>
                                <p className="font-bold text-xl">€{listing.price.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-midgray">Condizioni</p>
                                <p>{getConditionLabel(listing.condition)}</p>
                            </div>
                        </div>
                        
                        {listing.description && (
                            <div className="mb-4">
                                <p className="text-sm text-midgray mb-1">Descrizione</p>
                                <p className="text-darkgray">{listing.description}</p>
                            </div>
                        )}
                        
                        <div className="text-xs text-midgray">
                            <p>Pubblicato il: {new Date(listing.createdAt).toLocaleDateString('it-IT')}</p>
                            <p>Ultimo aggiornamento: {new Date(listing.updatedAt).toLocaleDateString('it-IT')}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pannello azioni */}
            <div className="border border-lightgray p-6">
                <h3 className="font-medium mb-4">Azioni</h3>
                
                <div className="space-y-3">
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full border border-black px-4 py-3 hover:bg-black hover:text-white transition-colors text-left"
                        >
                            ✏️ Modifica annuncio
                        </button>
                    )}
                    
                    {listing.status === 'ATTIVO' && (
                        <>
                            <button
                                onClick={() => handleStatusChange('VENDUTO')}
                                className="w-full border border-green-600 text-green-600 px-4 py-3 hover:bg-green-600 hover:text-white transition-colors text-left"
                            >
                                ✅ Segna come venduto
                            </button>
                            <button
                                onClick={() => handleStatusChange('SOSPESO')}
                                className="w-full border border-yellow-600 text-yellow-600 px-4 py-3 hover:bg-yellow-600 hover:text-white transition-colors text-left"
                            >
                                ⏸️ Sospendi annuncio
                            </button>
                        </>
                    )}
                    
                    {listing.status === 'SOSPESO' && (
                        <button
                            onClick={() => handleStatusChange('ATTIVO')}
                            className="w-full border border-green-600 text-green-600 px-4 py-3 hover:bg-green-600 hover:text-white transition-colors text-left"
                        >
                            ▶️ Riattiva annuncio
                        </button>
                    )}
                    
                    <button
                        onClick={handleDelete}
                        className="w-full border border-red-600 text-red-600 px-4 py-3 hover:bg-red-600 hover:text-white transition-colors text-left"
                    >
                        🗑️ Elimina annuncio
                    </button>
                </div>
            </div>

            {/* Link per tornare alla lista */}
            <div className="mt-6 text-center">
                <Link href="/user/annunci" className="text-sm text-midgray hover:text-black">
                    ← Torna alla lista dei tuoi annunci
                </Link>
            </div>
        </div>
    );
}
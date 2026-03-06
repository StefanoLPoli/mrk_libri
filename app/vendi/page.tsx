// app/vendi/page.tsx
'use client';

import { useState, useEffect  } from 'react';
import BookSearch from '@/components/BookSearch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface Book {
    isbn: string;
    title: string;
    author: string;
    publisher: string;
    publishedYear: number | null;
    pageCount: number | null;
    coverUrl: string | null;
    description: string | null;
}

export default function VendiPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    console.log('Sessione completa:', JSON.stringify(session, null, 2));
    
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [step, setStep] = useState(1);
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('BUONO');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Nuovi stati per le foto
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // ✅ EFFETTO PER IL REDIRECT
    useEffect(() => {
        if (status === 'loading') return; // Aspetta che il caricamento finisca
        
        if (!session) {
            router.push('/auth/login?callbackUrl=/vendi');
        }
    }, [session, status, router]); // Dipendenze

        // Funzione per gestire upload foto
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Limite di 5 foto
        if (images.length + files.length > 5) {
            alert('Puoi caricare massimo 5 foto');
            return;
        }

        setIsUploading(true);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Preview immediata
            const previewUrl = URL.createObjectURL(file);
            setImages(prev => [...prev, { url: previewUrl, file }]);

            // Upload effettivo (opzionale - puoi fare upload dopo o ora)
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    // Aggiorna URL con quello vero
                    setImages(prev => 
                        prev.map(img => 
                            img.url === previewUrl 
                                ? { ...img, url: data.url } 
                                : img
                        )
                    );
                }
            } catch (error) {
                console.error('Upload error:', error);
            }
        }

        setIsUploading(false);
    };

    const removeImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBook) return;
        
        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/listings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    book: selectedBook,
                    price,
                    condition,
                    description,
                    userId: session.user?.id,
                    images: images.map(img => img.url), // Passa array di URL
                }),
            });
            
            if (response.ok) {
                alert('✅ Annuncio pubblicato con successo!');
                router.push('/');
            } else {
                const data = await response.json();
                alert('❌ Errore: ' + data.error);
            }
        } catch (error) {
            alert('❌ Errore durante il salvataggio');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Se sta caricando, mostra un loader
    if (status === 'loading') {
        return <div className="container py-12 text-center">Caricamento...</div>;
    }
    
    // Se non c'è sessione, non mostrare nulla (l'useEffect farà il redirect)
    if (!session) {
        return null;
    }

    const handleBookSelected = (book: Book) => {
        setSelectedBook(book);
        setStep(2);
    };

    const resetSelection = () => {
        setSelectedBook(null);
        setStep(1);
    };



    return (
        <div className="container" style={{ maxWidth: '768px', margin: '0 auto', padding: '3rem 1rem' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: '#9ca3af', marginBottom: '2rem' }}>
                <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>Home</Link>
                <span>›</span>
                <span style={{ color: '#111111' }}>Vendi</span>
            </div>
            
            <h1 style={{ fontSize: '1.875rem', fontWeight: 300, marginBottom: '2rem' }}>Metti in vendita un libro</h1>
            
            {/* Progress indicator */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 1 ? '#111111' : '#9ca3af' }}>
                    <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: step >= 1 ? '#111111' : '#9ca3af',
                        backgroundColor: step >= 1 ? '#111111' : 'transparent',
                        color: step >= 1 ? 'white' : '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem'
                    }}>1</span>
                    <span>Trova libro</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step >= 2 ? '#111111' : '#9ca3af' }}>
                    <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: step >= 2 ? '#111111' : '#9ca3af',
                        backgroundColor: step >= 2 ? '#111111' : 'transparent',
                        color: step >= 2 ? 'white' : '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem'
                    }}>2</span>
                    <span>Aggiungi dettagli</span>
                </div>
            </div>
            
            {step === 1 ? (
                <>
                    <p style={{ color: '#374151', marginBottom: '1.5rem' }}>
                        Inserisci il codice ISBN del libro che vuoi vendere.
                        Lo trovi sul retro, vicino al codice a barre.
                    </p>
                    <BookSearch onBookSelected={handleBookSelected} />
                </>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Card riepilogo libro */}
                    <div className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
                        {selectedBook?.coverUrl ? (
                            <img
                                src={selectedBook.coverUrl}
                                alt={selectedBook.title}
                                style={{ width: '80px', height: '112px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ width: '80px', height: '112px', backgroundColor: '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                📚
                            </div>
                        )}
                        <div>
                            <h2 style={{ fontWeight: 500 }}>{selectedBook?.title}</h2>
                            <p style={{ fontSize: '0.875rem', color: '#374151' }}>{selectedBook?.author}</p>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                {selectedBook?.publisher} • {selectedBook?.publishedYear || 'Anno sconosciuto'}
                            </p>
                            <button
                                onClick={resetSelection}
                                style={{ fontSize: '0.75rem', color: '#374151', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}
                            >
                                Cambia libro
                            </button>
                        </div>
                    </div>
                    
                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                                Condizioni del libro
                            </label>
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e5e5',
                                    backgroundColor: 'white',
                                    fontSize: '1rem'
                                }}
                                required
                            >
                                <option value="COME_NUOVO">Come nuovo (mai usato)</option>
                                <option value="OTTIMO">Ottimo (sembra nuovo)</option>
                                <option value="BUONO">Buono (normali segni del tempo)</option>
                                <option value="ACCETTABILE">Accettabile (letto, ma completo)</option>
                            </select>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                                Prezzo (€)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e5e5',
                                    backgroundColor: 'white',
                                    fontSize: '1rem'
                                }}
                                placeholder="0,00"
                                required
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                                Descrizione (opzionale)
                            </label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #e5e5e5',
                                    backgroundColor: 'white',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit'
                                }}
                                placeholder="Eventuali note su condizioni, difetti, ecc."
                            />
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                                Foto del libro (max 5)
                            </label>
                            
                            {/* Preview foto */}
                            {images.length > 0 && (
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                    gap: '0.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    {images.map((img, index) => (
                                        <div key={index} style={{ position: 'relative' }}>
                                            <img 
                                                src={img.url} 
                                                alt={`Preview ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100px',
                                                    objectFit: 'cover',
                                                    border: '1px solid #e5e5e5'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(0,0,0,0.5)',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* Bottone upload */}
                            {images.length < 5 && (
                                <div style={{
                                    border: '2px dashed #e5e5e5',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    position: 'relative'
                                }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                        {isUploading ? '📸 Caricamento...' : '📸 Clicca per aggiungere foto'}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                        PNG, JPG, GIF max 5MB
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                backgroundColor: isSubmitting ? '#9ca3af' : '#111111',
                                color: 'white',
                                padding: '1rem',
                                border: 'none',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                fontWeight: 500
                            }}
                        >
                            {isSubmitting ? 'Pubblicazione...' : 'Pubblica annuncio'}
                        </button>
                    </form>
                </div>
            )}
            
            {/* Info box */}
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#f8f8f8',
                border: '1px solid #e5e5e5'
            }}>
                <p style={{ fontSize: '0.875rem', color: '#374151' }}>
                    <span style={{ fontWeight: 500 }}>📌 Come funziona:</span> Dopo la pubblicazione, gli interessati ti contatteranno via chat per organizzare lo scambio o la spedizione. Zero commissioni.
                </p>
            </div>
        </div>
    );
}
// components/BookSearch.tsx
'use client';

import { useState } from 'react';

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

interface BookSearchProps {
    onBookSelected: (book: Book) => void;
}

export default function BookSearch({ onBookSelected }: BookSearchProps) {
    const [isbn, setIsbn] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchBook = async () => {
        if (!isbn.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/books/fetch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isbn: isbn.trim() }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Errore nella ricerca');
            }
            
            onBookSelected(data.book);
            
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            searchBook();
        }
    };

    return (
        <div className="bg-white border border-lightgray p-6">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="ISBN (es. 9788807881060)"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 p-3 border border-lightgray bg-white focus:outline-none focus:border-black"
                />
                <button
                    onClick={searchBook}
                    disabled={loading || !isbn.trim()}
                    className="px-6 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors disabled:border-lightgray disabled:text-lightgray disabled:hover:bg-white"
                >
                    {loading ? '...' : 'Cerca'}
                </button>
            </div>
            
            {error && (
                <div className="mt-4 p-3 border border-red-500 bg-red-50 text-red-700 text-sm">
                    ❌ {error}
                </div>
            )}
            
            <p className="text-xs text-midgray mt-3">
                Inserisci il codice ISBN a 10 o 13 cifre (senza spazi)
            </p>
        </div>
    );
}
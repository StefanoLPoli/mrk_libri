// app/admin/cache/page.tsx (modifica le fetch)
'use client';

import { useEffect, useState } from 'react';

interface CacheStats {
    size: number;
    entries: Array<{
        isbn: string;
        title: string;
        cachedAt: string;
    }>;
}

export default function CachePage() {
    const [stats, setStats] = useState<CacheStats | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchCacheStats();
    }, []);
    
    const fetchCacheStats = async () => {
        setLoading(true);
        try {
            // CAMBIA QUESTO: da /admin/cache a /api/admin/cache
            const response = await fetch('/api/admin/cache');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Errore:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const clearCache = async () => {
        if (!confirm('Sicuro di voler cancellare la cache?')) return;
        
        try {
            // CAMBIA ANCHE QUESTO
            const response = await fetch('/api/admin/cache', {
                method: 'DELETE',
            });
            if (response.ok) {
                alert('Cache cancellata');
                fetchCacheStats();
            }
        } catch (error) {
            console.error('Errore:', error);
        }
    };
    
    if (loading) return <div>Caricamento...</div>;
    
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">📊 Statistiche Cache</h1>
                <button
                    onClick={clearCache}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Cancella Cache
                </button>
            </div>
            
            <div className="mb-6 p-4 bg-blue-50 rounded">
                <p className="text-lg">
                    <strong>Libri in cache:</strong> {stats?.size || 0}
                </p>
            </div>
            
            {stats?.entries && stats.entries.length > 0 ? (
                <div className="grid gap-4">
                    {stats.entries.map((entry) => (
                        <div key={entry.isbn} className="border rounded p-4">
                            <p><strong>Titolo:</strong> {entry.title}</p>
                            <p><strong>ISBN:</strong> {entry.isbn}</p>
                            <p><strong>Cache dal:</strong> {entry.cachedAt}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">Nessun libro in cache</p>
            )}
        </div>
    );
}
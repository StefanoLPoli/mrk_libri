// app/compra/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

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

interface Filters {
    condition: string[];
    minPrice: string;
    maxPrice: string;
    sortBy: string;
}

export default function CompraPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState(searchQuery);
    const [filters, setFilters] = useState<Filters>({
        condition: [],
        minPrice: '',
        maxPrice: '',
        sortBy: 'recent'
    });
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Opzioni per i filtri
    const conditionOptions = [
        { value: 'COME_NUOVO', label: 'Come nuovo' },
        { value: 'OTTIMO', label: 'Ottimo' },
        { value: 'BUONO', label: 'Buono' },
        { value: 'ACCETTABILE', label: 'Accettabile' }
    ];

    const sortOptions = [
        { value: 'recent', label: 'Più recenti' },
        { value: 'price_asc', label: 'Prezzo: dal più basso' },
        { value: 'price_desc', label: 'Prezzo: dal più alto' }
    ];

    useEffect(() => {
        // Leggi filtri dall'URL all'avvio
        const conditionParam = searchParams.get('condition');
        const minPriceParam = searchParams.get('minPrice');
        const maxPriceParam = searchParams.get('maxPrice');
        const sortParam = searchParams.get('sort');

        setFilters({
            condition: conditionParam ? conditionParam.split(',') : [],
            minPrice: minPriceParam || '',
            maxPrice: maxPriceParam || '',
            sortBy: sortParam || 'recent'
        });
    }, []);

    useEffect(() => {
        fetchListings();
    }, [searchQuery, filters]); // Rifare fetch quando cambia query o filtri

    const fetchListings = async () => {
        setLoading(true);
        try {
            // Costruisci URL con tutti i parametri
            const params = new URLSearchParams();
            
            if (searchQuery) {
                params.append('q', searchQuery);
            }
            
            if (filters.condition.length > 0) {
                params.append('condition', filters.condition.join(','));
            }
            
            if (filters.minPrice) {
                params.append('minPrice', filters.minPrice);
            }
            
            if (filters.maxPrice) {
                params.append('maxPrice', filters.maxPrice);
            }
            
            if (filters.sortBy) {
                params.append('sort', filters.sortBy);
            }
            
            const url = `/api/listings${params.toString() ? `?${params.toString()}` : ''}`;
            
            const response = await fetch(url);
            const data = await response.json();
            setListings(data);
        } catch (error) {
            console.error('Errore:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            updateUrl({ q: searchInput.trim() });
        }
    };

    const updateUrl = (newParams: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        // Aggiorna i parametri
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        
        router.push(`/compra${params.toString() ? `?${params.toString()}` : ''}`);
    };

    const handleConditionChange = (value: string) => {
        const newConditions = filters.condition.includes(value)
            ? filters.condition.filter(c => c !== value)
            : [...filters.condition, value];
        
        setFilters({ ...filters, condition: newConditions });
        updateUrl({ condition: newConditions.join(',') });
    };

    const handlePriceChange = (type: 'min' | 'max', value: string) => {
        const newFilters = { ...filters };
        if (type === 'min') {
            newFilters.minPrice = value;
        } else {
            newFilters.maxPrice = value;
        }
        setFilters(newFilters);
        updateUrl({ 
            minPrice: newFilters.minPrice,
            maxPrice: newFilters.maxPrice 
        });
    };

    const handleSortChange = (value: string) => {
        setFilters({ ...filters, sortBy: value });
        updateUrl({ sort: value });
    };

    const removeFilter = (type: string, value?: string) => {
        switch(type) {
            case 'search':
                // Rimuovi la ricerca
                setSearchInput('');
                updateUrl({ q: '' });
                break;
            case 'condition':
                if (value) {
                    const newConditions = filters.condition.filter(c => c !== value);
                    setFilters({ ...filters, condition: newConditions });
                    updateUrl({ condition: newConditions.join(',') });
                }
                break;
            case 'minPrice':
                setFilters({ ...filters, minPrice: '' });
                updateUrl({ minPrice: '' });
                break;
            case 'maxPrice':
                setFilters({ ...filters, maxPrice: '' });
                updateUrl({ maxPrice: '' });
                break;
        }
    };

    const clearAllFilters = () => {
        setSearchInput(''); 
        setFilters({
            condition: [],
            minPrice: '',
            maxPrice: '',
            sortBy: 'recent'
        });
        updateUrl({ q: '', condition: '', minPrice: '', maxPrice: '', sort: 'recent' });
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

    // Conta filtri attivi
    const activeFiltersCount = 
        (searchQuery ? 1 : 0) + 
        filters.condition.length + 
        (filters.minPrice ? 1 : 0) + 
        (filters.maxPrice ? 1 : 0);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-12 text-center">
                Caricamento annunci...
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header con titolo e barra ricerca */}
            <div className="mb-6">
                <h1 className="text-3xl font-light mb-4">
                    {searchQuery ? (
                        <>Risultati per: <span className="font-medium">"{searchQuery}"</span></>
                    ) : (
                        'Libri in vendita'
                    )}
                </h1>
                
                {/* Barra di ricerca */}
                <form onSubmit={handleSearch} className="max-w-2xl">
                    <div className="flex">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Cerca per titolo, autore o ISBN..."
                            className="flex-1 px-4 py-2 border border-r-0 border-gray-300 focus:outline-none focus:border-black"
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors border border-black"
                        >
                            Cerca
                        </button>
                    </div>
                </form>
            </div>

            {/* Bottone filtri mobile */}
            <div className="lg:hidden mb-4">
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full border border-gray-300 py-2 flex items-center justify-center gap-2"
                >
                    <span>Filtri</span>
                    {activeFiltersCount > 0 && (
                        <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Layout principale: sidebar + griglia */}
            <div className="flex gap-8">
                {/* Sidebar filtri - desktop sempre visibile, mobile toggle */}
                <div className={`
                    lg:block lg:w-64 flex-shrink-0
                    ${showMobileFilters ? 'block' : 'hidden'}
                `}>
                    <div className="bg-gray-50 p-4 sticky top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium">Filtri</h3>
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-gray-600 hover:text-black underline"
                                >
                                    Cancella tutto
                                </button>
                            )}
                        </div>

                        {/* Condizioni */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium mb-2">Condizioni</h4>
                            <div className="space-y-2">
                                {conditionOptions.map(option => (
                                    <label key={option.value} className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={filters.condition.includes(option.value)}
                                            onChange={() => handleConditionChange(option.value)}
                                            className="rounded border-gray-300"
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Prezzo */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium mb-2">Prezzo</h4>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min €"
                                    value={filters.minPrice}
                                    onChange={(e) => handlePriceChange('min', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Max €"
                                    value={filters.maxPrice}
                                    onChange={(e) => handlePriceChange('max', e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 text-sm"
                                />
                            </div>
                        </div>

                        {/* Ordinamento */}
                        <div>
                            <h4 className="text-sm font-medium mb-2">Ordina per</h4>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 bg-white text-sm"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Colonna destra: risultati e chip filtri */}
                <div className="flex-1">
                    {/* Chip filtri attivi */}
                    {activeFiltersCount > 0 && (
                        <div className="mb-4 flex flex-wrap gap-2">
                            {/* Chip per la ricerca */}
                            {searchQuery && (
                                <button
                                    onClick={() => removeFilter('search')}
                                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-sm rounded-full"
                                >
                                    <span className="font-medium">"{searchQuery}"</span>
                                    <span className="ml-1">✕</span>
                                </button>
                            )}
                            
                            {/* Chip per le condizioni */}
                            {filters.condition.map(cond => (
                                <button
                                    key={cond}
                                    onClick={() => removeFilter('condition', cond)}
                                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded-full"
                                >
                                    {getConditionLabel(cond)}
                                    <span className="ml-1">✕</span>
                                </button>
                            ))}
                            
                            {/* Chip per prezzo minimo */}
                            {filters.minPrice && (
                                <button
                                    onClick={() => removeFilter('minPrice')}
                                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded-full"
                                >
                                    Min €{filters.minPrice}
                                    <span className="ml-1">✕</span>
                                </button>
                            )}
                            
                            {/* Chip per prezzo massimo */}
                            {filters.maxPrice && (
                                <button
                                    onClick={() => removeFilter('maxPrice')}
                                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded-full"
                                >
                                    Max €{filters.maxPrice}
                                    <span className="ml-1">✕</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Intestazione risultati */}
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600">
                            {listings.length} {listings.length === 1 ? 'annuncio trovato' : 'annunci trovati'}
                        </p>
                        <Link 
                            href="/vendi" 
                            className="border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors text-sm"
                        >
                            + Vendi un libro
                        </Link>
                    </div>

                    {/* Griglia risultati */}
                    {listings.length === 0 ? (
                        <div className="text-center py-12 border border-gray-200 bg-gray-50">
                            <p className="text-gray-600 mb-4">
                                {searchQuery 
                                    ? `Nessun annuncio trovato per "${searchQuery}"` 
                                    : 'Nessun annuncio al momento'}
                            </p>
                            {searchQuery && (
                                <button
                                    onClick={() => {
                                        setSearchInput('');
                                        updateUrl({ q: '' });
                                    }}
                                    className="text-black underline mb-4 block"
                                >
                                    Cancella ricerca
                                </button>
                            )}
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
                                    href={`/compra/${listing.id}`}
                                    className="block border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                >
                                    <div className="flex gap-4">
                                        {listing.book.coverUrl ? (
                                            <img 
                                                src={listing.book.coverUrl} 
                                                alt={listing.book.title}
                                                className="w-20 h-28 object-cover"
                                            />
                                        ) : (
                                            <div className="w-20 h-28 bg-gray-100 flex items-center justify-center text-gray-400">
                                                📚
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-medium line-clamp-2">{listing.book.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-1">{listing.book.author}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {listing.book.publishedYear || 'Anno sconosciuto'}
                                            </p>
                                            <div className="mt-2">
                                                <span className="text-sm font-bold">€{listing.price.toFixed(2)}</span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {getConditionLabel(listing.condition)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                                        <span>Venduto da: {listing.user.name || listing.user.email}</span>
                                        <span className="text-black text-sm">→</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
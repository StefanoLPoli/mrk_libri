// app/compra/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, FunnelIcon, MinusIcon, PlusIcon } from '@heroicons/react/20/solid';

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
    author: string[];
    publisher: string[];
    language: string[];
    sortBy: string;
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export default function CompraPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || '';
    
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        condition: [],
        minPrice: '',
        maxPrice: '',
        author: [],
        publisher: [],
        language: [],
        sortBy: 'recent'
    });

    // Opzioni per i filtri
    const sortOptions = [
        { name: 'Più recenti', value: 'recent', current: false },
        { name: 'Prezzo: dal più basso', value: 'price_asc', current: false },
        { name: 'Prezzo: dal più alto', value: 'price_desc', current: false },
    ];

    const conditionOptions = [
        { value: 'COME_NUOVO', label: 'Come nuovo', checked: false },
        { value: 'OTTIMO', label: 'Ottimo', checked: false },
        { value: 'BUONO', label: 'Buono', checked: false },
        { value: 'ACCETTABILE', label: 'Accettabile', checked: false }
    ];

    // Raccogli autori unici dagli annunci
    const authorOptions = Array.from(new Set(
        listings
            .map(l => l.book.author)
            .filter((a): a is string => a !== null && a !== 'Autore sconosciuto')
    )).slice(0, 10).map(author => ({
        value: author,
        label: author,
        checked: filters.author.includes(author)
    }));

    const filtersConfig = [
        {
            id: 'condition',
            name: 'Condizioni',
            options: conditionOptions.map(opt => ({
                ...opt,
                checked: filters.condition.includes(opt.value)
            }))
        },
        {
            id: 'author',
            name: 'Autori',
            options: authorOptions
        },
        {
            id: 'publisher',
            name: 'Editore',
            options: [] // Da implementare con dati reali
        },
        {
            id: 'language',
            name: 'Lingua',
            options: [
                { value: 'italiano', label: 'Italiano', checked: filters.language.includes('italiano') },
                { value: 'inglese', label: 'Inglese', checked: filters.language.includes('inglese') },
                { value: 'francese', label: 'Francese', checked: filters.language.includes('francese') },
            ]
        }
    ];

    useEffect(() => {
        // Leggi filtri dall'URL all'avvio
        const conditionParam = searchParams.get('condition');
        const minPriceParam = searchParams.get('minPrice');
        const maxPriceParam = searchParams.get('maxPrice');
        const authorParam = searchParams.get('author');
        const publisherParam = searchParams.get('publisher');
        const languageParam = searchParams.get('language');
        const sortParam = searchParams.get('sort');

        setFilters({
            condition: conditionParam ? conditionParam.split(',') : [],
            minPrice: minPriceParam || '',
            maxPrice: maxPriceParam || '',
            author: authorParam ? authorParam.split(',') : [],
            publisher: publisherParam ? publisherParam.split(',') : [],
            language: languageParam ? languageParam.split(',') : [],
            sortBy: sortParam || 'recent'
        });
    }, []);

    useEffect(() => {
        fetchListings();
    }, [searchQuery, filters]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            
            if (searchQuery) params.append('q', searchQuery);
            if (filters.condition.length > 0) params.append('condition', filters.condition.join(','));
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.author.length > 0) params.append('author', filters.author.join(','));
            if (filters.publisher.length > 0) params.append('publisher', filters.publisher.join(','));
            if (filters.language.length > 0) params.append('language', filters.language.join(','));
            if (filters.sortBy) params.append('sort', filters.sortBy);
            
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

    const updateUrl = (newParams: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        
        router.push(`/compra${params.toString() ? `?${params.toString()}` : ''}`);
    };

    const handleFilterChange = (sectionId: string, value: string) => {
        const newFilters = { ...filters };
        
        switch(sectionId) {
            case 'condition':
                newFilters.condition = filters.condition.includes(value)
                    ? filters.condition.filter(v => v !== value)
                    : [...filters.condition, value];
                updateUrl({ condition: newFilters.condition.join(',') });
                break;
            case 'author':
                newFilters.author = filters.author.includes(value)
                    ? filters.author.filter(v => v !== value)
                    : [...filters.author, value];
                updateUrl({ author: newFilters.author.join(',') });
                break;
            case 'publisher':
                newFilters.publisher = filters.publisher.includes(value)
                    ? filters.publisher.filter(v => v !== value)
                    : [...filters.publisher, value];
                updateUrl({ publisher: newFilters.publisher.join(',') });
                break;
            case 'language':
                newFilters.language = filters.language.includes(value)
                    ? filters.language.filter(v => v !== value)
                    : [...filters.language, value];
                updateUrl({ language: newFilters.language.join(',') });
                break;
        }
        
        setFilters(newFilters);
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

    const clearAllFilters = () => {
        setFilters({
            condition: [],
            minPrice: '',
            maxPrice: '',
            author: [],
            publisher: [],
            language: [],
            sortBy: 'recent'
        });
        updateUrl({ 
            condition: '', 
            minPrice: '', 
            maxPrice: '', 
            author: '', 
            publisher: '', 
            language: '', 
            sort: 'recent' 
        });
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

    const activeFiltersCount = 
        filters.condition.length + 
        filters.author.length + 
        filters.publisher.length + 
        filters.language.length +
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
        <div className="bg-white">
            {/* Mobile filter dialog */}
            <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative z-40 lg:hidden">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
                />

                <div className="fixed inset-0 z-40 flex">
                    <DialogPanel
                        transition
                        className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-white pt-4 pb-6 shadow-xl transition duration-300 ease-in-out data-closed:translate-x-full"
                    >
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-lg font-medium text-gray-900">Filtri</h2>
                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen(false)}
                                className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                            >
                                <span className="absolute -inset-0.5" />
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon aria-hidden="true" className="size-6" />
                            </button>
                        </div>

                        {/* Filtri mobile */}
                        <form className="mt-4 border-t border-gray-200">
                            {filtersConfig.map((section) => (
                                <Disclosure key={section.id} as="div" className="border-t border-gray-200 px-4 py-6">
                                    <h3 className="-mx-2 -my-3 flow-root">
                                        <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                            <span className="font-medium text-gray-900">{section.name}</span>
                                            <span className="ml-6 flex items-center">
                                                <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                                                <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                                            </span>
                                        </DisclosureButton>
                                    </h3>
                                    <DisclosurePanel className="pt-6">
                                        <div className="space-y-6">
                                            {section.options.map((option, optionIdx) => (
                                                <div key={option.value} className="flex gap-3">
                                                    <div className="flex h-5 shrink-0 items-center">
                                                        <div className="group grid size-4 grid-cols-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={option.checked}
                                                                onChange={() => handleFilterChange(section.id, option.value)}
                                                                className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100"
                                                            />
                                                        </div>
                                                    </div>
                                                    <label className="min-w-0 flex-1 text-gray-500">
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </DisclosurePanel>
                                </Disclosure>
                            ))}
                            
                            {/* Prezzo mobile */}
                            <Disclosure as="div" className="border-t border-gray-200 px-4 py-6">
                                <h3 className="-mx-2 -my-3 flow-root">
                                    <DisclosureButton className="group flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                        <span className="font-medium text-gray-900">Prezzo</span>
                                        <span className="ml-6 flex items-center">
                                            <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                                            <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                                        </span>
                                    </DisclosureButton>
                                </h3>
                                <DisclosurePanel className="pt-6">
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min €"
                                            value={filters.minPrice}
                                            onChange={(e) => handlePriceChange('min', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded-md"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max €"
                                            value={filters.maxPrice}
                                            onChange={(e) => handlePriceChange('max', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded-md"
                                        />
                                    </div>
                                </DisclosurePanel>
                            </Disclosure>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-baseline justify-between border-b border-gray-200 pt-6 pb-6">
                    <h1 className="text-2xl font-light tracking-tight text-gray-900">
                        {searchQuery ? (
                            <>Risultati per: <span className="font-medium">"{searchQuery}"</span></>
                        ) : (
                            'Libri in vendita'
                        )}
                    </h1>

                    <div className="flex items-center">
                        <Menu as="div" className="relative inline-block text-left">
                            <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                                Ordina
                                <ChevronDownIcon
                                    aria-hidden="true"
                                    className="-mr-1 ml-1 size-5 shrink-0 text-gray-400 group-hover:text-gray-500"
                                />
                            </MenuButton>

                            <MenuItems
                                transition
                                className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                            >
                                <div className="py-1">
                                    {sortOptions.map((option) => (
                                        <MenuItem key={option.value}>
                                            <button
                                                onClick={() => handleSortChange(option.value)}
                                                className={classNames(
                                                    filters.sortBy === option.value ? 'font-medium text-gray-900' : 'text-gray-500',
                                                    'block w-full text-left px-4 py-2 text-sm data-focus:bg-gray-100 data-focus:outline-hidden',
                                                )}
                                            >
                                                {option.name}
                                            </button>
                                        </MenuItem>
                                    ))}
                                </div>
                            </MenuItems>
                        </Menu>

                        <button
                            type="button"
                            onClick={() => setMobileFiltersOpen(true)}
                            className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden relative"
                        >
                            <span className="sr-only">Filtri</span>
                            <FunnelIcon aria-hidden="true" className="size-5" />
                            {activeFiltersCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Chip filtri attivi */}
                {activeFiltersCount > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {filters.condition.map(cond => (
                            <button
                                key={cond}
                                onClick={() => handleFilterChange('condition', cond)}
                                className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full hover:bg-indigo-100"
                            >
                                {getConditionLabel(cond)}
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        ))}
                        {filters.minPrice && (
                            <button
                                onClick={() => handlePriceChange('min', '')}
                                className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full hover:bg-indigo-100"
                            >
                                Min €{filters.minPrice}
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                        {filters.maxPrice && (
                            <button
                                onClick={() => handlePriceChange('max', '')}
                                className="flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full hover:bg-indigo-100"
                            >
                                Max €{filters.maxPrice}
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                        {activeFiltersCount > 1 && (
                            <button
                                onClick={clearAllFilters}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 underline"
                            >
                                Cancella tutto
                            </button>
                        )}
                    </div>
                )}

                <section aria-labelledby="products-heading" className="pt-6 pb-24">
                    <h2 id="products-heading" className="sr-only">
                        Annunci
                    </h2>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                        {/* Filtri desktop */}
                        <form className="hidden lg:block">
                            {filtersConfig.map((section) => (
                                <Disclosure key={section.id} as="div" className="border-b border-gray-200 py-6">
                                    <h3 className="-my-3 flow-root">
                                        <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                                            <span className="font-medium text-gray-900">{section.name}</span>
                                            <span className="ml-6 flex items-center">
                                                <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                                                <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                                            </span>
                                        </DisclosureButton>
                                    </h3>
                                    <DisclosurePanel className="pt-6">
                                        <div className="space-y-4">
                                            {section.options.map((option, optionIdx) => (
                                                <div key={option.value} className="flex gap-3">
                                                    <div className="flex h-5 shrink-0 items-center">
                                                        <div className="group grid size-4 grid-cols-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={option.checked}
                                                                onChange={() => handleFilterChange(section.id, option.value)}
                                                                className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                            />
                                                        </div>
                                                    </div>
                                                    <label className="text-sm text-gray-600">
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </DisclosurePanel>
                                </Disclosure>
                            ))}

                            {/* Prezzo desktop */}
                            <Disclosure as="div" className="border-b border-gray-200 py-6">
                                <h3 className="-my-3 flow-root">
                                    <DisclosureButton className="group flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
                                        <span className="font-medium text-gray-900">Prezzo</span>
                                        <span className="ml-6 flex items-center">
                                            <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                                            <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                                        </span>
                                    </DisclosureButton>
                                </h3>
                                <DisclosurePanel className="pt-6">
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min €"
                                            value={filters.minPrice}
                                            onChange={(e) => handlePriceChange('min', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded-md"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max €"
                                            value={filters.maxPrice}
                                            onChange={(e) => handlePriceChange('max', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 text-sm rounded-md"
                                        />
                                    </div>
                                </DisclosurePanel>
                            </Disclosure>
                        </form>

                        {/* Griglia prodotti */}
                        <div className="lg:col-span-3">
                            <p className="text-sm text-gray-600 mb-4">
                                {listings.length} {listings.length === 1 ? 'annuncio trovato' : 'annunci trovati'}
                            </p>

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
                                                const params = new URLSearchParams(searchParams.toString());
                                                params.delete('q');
                                                router.push(`/compra${params.toString() ? `?${params.toString()}` : ''}`);
                                            }}
                                            className="text-indigo-600 underline mb-4 block"
                                        >
                                            Cancella ricerca
                                        </button>
                                    )}
                                    <Link 
                                        href="/vendi" 
                                        className="text-indigo-600 underline"
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
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
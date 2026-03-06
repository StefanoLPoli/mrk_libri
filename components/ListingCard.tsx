// components/ListingCard.tsx (da creare o modificare)
'use client';

interface ListingCardProps {
    listing: {
        id: string;
        price: number;
        condition: string;
        images: string | null;
        book: {
            title: string;
            author: string;
            coverUrl: string | null;
        };
    };
}

export default function ListingCard({ listing }: ListingCardProps) {
    // Parsing delle foto (se presenti)
    const images = listing.images ? JSON.parse(listing.images) : [];
    const firstImage = images.length > 0 ? images[0] : null;

    return (
        <div className="border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="aspect-[3/4] bg-gray-100 relative">
                {firstImage ? (
                    <img 
                        src={firstImage} 
                        alt={listing.book.title}
                        className="w-full h-full object-cover"
                    />
                ) : listing.book.coverUrl ? (
                    <img 
                        src={listing.book.coverUrl} 
                        alt={listing.book.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        📚
                    </div>
                )}
                
                {/* Badge condizioni */}
                <span className="absolute top-2 right-2 bg-white px-2 py-1 text-xs border border-gray-200">
                    {listing.condition === 'COME_NUOVO' && 'Come nuovo'}
                    {listing.condition === 'OTTIMO' && 'Ottimo'}
                    {listing.condition === 'BUONO' && 'Buono'}
                    {listing.condition === 'ACCETTABILE' && 'Accettabile'}
                </span>
            </div>
            
            <div className="p-4">
                <h3 className="font-medium truncate">{listing.book.title}</h3>
                <p className="text-sm text-gray-600 truncate">{listing.book.author}</p>
                <p className="text-lg font-semibold mt-2">€{listing.price.toFixed(2)}</p>
            </div>
        </div>
    );
}
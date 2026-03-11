// app/api/books/fetch/route.ts
import { bookCache } from '@/lib/bookCache';
import { NextResponse } from 'next/server';

// Configurazione Google Books
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY || '';

// Funzione per cercare su Open Library
async function fetchFromOpenLibrary(isbn: string) {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    const response = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`,
        {
            headers: {
                'User-Agent': 'MarketplaceLibri/1.0 (tuo-email@example.com)'
            }
        }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const bookKey = `ISBN:${cleanIsbn}`;
    const bookData = data[bookKey];
    
    if (!bookData) return null;
    
    // MIGLIORAMENTO: Ottieni la migliore immagine possibile
    let coverUrl = null;
    if (bookData.cover) {
        // Prova large, altrimenti converti medium o small in large
        coverUrl = bookData.cover?.large || 
                  (bookData.cover?.medium ? bookData.cover.medium.replace('-M.jpg', '-L.jpg') : null) ||
                  (bookData.cover?.small ? bookData.cover.small.replace('-S.jpg', '-L.jpg') : null);
    }
    
    return {
        isbn: cleanIsbn,
        title: bookData.title || 'Titolo sconosciuto',
        author: bookData.authors?.map((a: any) => a.name).join(', ') || 'Autore sconosciuto',
        publisher: bookData.publishers?.[0]?.name || 'Editore sconosciuto',
        publishedYear: bookData.publish_date ? extractYear(bookData.publish_date) : null,
        pageCount: bookData.number_of_pages || null,
        coverUrl,
        description: bookData.excerpts?.[0]?.text || null,
        language: bookData.language || null,
    };
}

// Funzione per cercare su Google Books
async function fetchFromGoogleBooks(isbn: string) {
    if (!GOOGLE_BOOKS_API_KEY) {
        console.warn('Google Books API key non configurata');
        return null;
    }
    
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}&key=${GOOGLE_BOOKS_API_KEY}`
        );
        
        if (!response.ok) return null;
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) return null;
        
        const bookData = data.items[0].volumeInfo;
        
        // MIGLIORAMENTO: Ottieni immagine HD da Google Books
        let coverUrl = bookData.imageLinks?.thumbnail || bookData.imageLinks?.smallThumbnail || null;
        
        if (coverUrl) {
            // Google Books: zoom=1 (piccolo), zoom=2 (medio), zoom=3 (grande)
            coverUrl = coverUrl
                .replace('zoom=1', 'zoom=3')  // Forza zoom grande
                .replace('http:', 'https:')   // Forza HTTPS
                .replace('&edge=curl', '')    // Rimuovi effetto pagina curva
                .replace('&printsec=frontcover', '&printsec=frontcover&source=gbs_api'); // Aggiungi parametri
            
            // Se l'URL contiene '&pg=PP1&img=1', prova a cambiare img=1 con img=10 per qualità maggiore
            if (coverUrl.includes('&pg=PP1&img=1')) {
                coverUrl = coverUrl.replace('&pg=PP1&img=1', '&pg=PP1&img=10');
            }
            
            // Alcune immagini Google hanno bisogno di questa trasformazione
            if (coverUrl.includes('&source=gbs_api')) {
                coverUrl = coverUrl.replace('&source=gbs_api', '&source=gbs_api&w=1280'); // Forza larghezza
            }
        }
        
        return {
            isbn: cleanIsbn,
            title: bookData.title || 'Titolo sconosciuto',
            author: bookData.authors?.join(', ') || 'Autore sconosciuto',
            publisher: bookData.publisher || 'Editore sconosciuto',
            publishedYear: bookData.publishedDate ? extractYear(bookData.publishedDate) : null,
            pageCount: bookData.pageCount || null,
            coverUrl,
            description: bookData.description || null,
            language: bookData.language || null,
        };
    } catch (error) {
        console.error('Errore Google Books:', error);
        return null;
    }
}

// Funzione helper per estrarre l'anno
function extractYear(dateString: string): number | null {
    if (!dateString) return null;
    const match = dateString.match(/\b(19|20)\d{2}\b/);
    return match ? parseInt(match[0]) : null;
}

// Funzione per ottenere libro con cache
async function getBookWithCache(isbn: string) {
    const cleanIsbn = isbn.replace(/[-\s]/g, '');
    
    // Controlla cache persistente
    const cached = bookCache.get(cleanIsbn);
    if (cached) {
        console.log('📦 Libro trovato in cache:', cleanIsbn);
        return cached;
    }
    
    console.log('🔍 Cerco libro:', cleanIsbn);
    
    // Prova Open Library
    let book = await fetchFromOpenLibrary(cleanIsbn);
    let source = 'openlibrary';
    
    // Se Open Library non trova, prova Google Books
    if (!book) {
        console.log('↪️ Non trovato su Open Library, provo Google Books');
        book = await fetchFromGoogleBooks(cleanIsbn);
        source = 'googlebooks';
    }
    
    // Se trovato, salva in cache
    if (book) {
        console.log(`✅ Trovato su ${source} con immagine:`, book.coverUrl ? '✅' : '❌');
        bookCache.set(cleanIsbn, book);
    }
    
    return book;
}

// Handler POST
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { isbn } = body;
        
        if (!isbn) {
            return NextResponse.json(
                { error: 'ISBN richiesto' },
                { status: 400 }
            );
        }
        
        const cleanIsbn = isbn.replace(/[-\s]/g, '');
        
        // Validazione formato ISBN
        const isValidIsbn = /^\d{10}(\d{3})?$/.test(cleanIsbn);
        if (!isValidIsbn) {
            return NextResponse.json(
                { error: 'Formato ISBN non valido' },
                { status: 400 }
            );
        }
        
        const book = await getBookWithCache(cleanIsbn);
        
        if (!book) {
            return NextResponse.json(
                { error: 'Libro non trovato' },
                { status: 404 }
            );
        }
        
        return NextResponse.json({
            success: true,
            book: book
        });
        
    } catch (error) {
        console.error('Errore API:', error);
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { error: 'Metodo non consentito. Usa POST con un ISBN.' },
        { status: 405 }
    );
}
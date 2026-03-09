// app/api/listings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('📥 API ricevuta:', body);
        
        // Estrai anche images dal body
        const { book, price, condition, description, userId, images } = body;
        
        // Validazione base
        if (!book?.isbn) {
            console.log('❌ ISBN mancante');
            return NextResponse.json(
                { error: 'ISBN mancante' },
                { status: 400 }
            );
        }
        
        if (!price) {
            console.log('❌ Prezzo mancante');
            return NextResponse.json(
                { error: 'Prezzo mancante' },
                { status: 400 }
            );
        }
        
        if (!condition) {
            console.log('❌ Condizione mancante');
            return NextResponse.json(
                { error: 'Condizione mancante' },
                { status: 400 }
            );
        }
        
        if (!userId) {
            console.log('❌ UserId mancante');
            return NextResponse.json(
                { error: 'Utente non specificato' },
                { status: 400 }
            );
        }
        
        // Cerca se il libro esiste già nel database
        let existingBook = await prisma.book.findUnique({
            where: { isbn: book.isbn }
        });
        
        console.log('📚 Libro esistente?', existingBook ? 'Sì' : 'No');
        
        // Se non esiste, lo crea
        if (!existingBook) {
            console.log('➕ Creazione nuovo libro...');
            existingBook = await prisma.book.create({
                data: {
                    isbn: book.isbn,
                    title: book.title,
                    author: book.author,
                    publisher: book.publisher,
                    publishedYear: book.publishedYear ? parseInt(book.publishedYear) : null,
                    pageCount: book.pageCount ? parseInt(book.pageCount) : null,
                    coverUrl: book.coverUrl,
                    description: book.description,
                }
            });
            console.log('✅ Libro creato:', existingBook.id);
        }
        
        // Prepara le immagini (se presenti)
        let imagesJson = null;
        if (images && Array.isArray(images) && images.length > 0) {
            // Filtra solo URL validi (quelli che iniziano con /uploads/ o http)
            const validImages = images.filter((img: string) => 
                img && (img.startsWith('/uploads/') || img.startsWith('http'))
            );
            
            if (validImages.length > 0) {
                imagesJson = JSON.stringify(validImages);
                console.log('📸 Foto caricate:', validImages.length);
            } else {
                console.log('📸 Nessuna foto valida');
            }
        } else {
            console.log('📸 Nessuna foto fornita');
        }
        
        // Crea l'annuncio
        console.log('➕ Creazione annuncio...');
        const listing = await prisma.listing.create({
            data: {
                bookId: existingBook.id,
                userId: userId,
                price: parseFloat(price),
                condition: condition,
                description: description || '',
                images: imagesJson,
                status: 'ATTIVO'
            }
        });
        
        console.log('✅ Annuncio creato:', listing.id);
        
        return NextResponse.json({
            success: true,
            listing: listing
        });
        
    } catch (error) {
        console.error('❌ Errore API:', error);
        return NextResponse.json(
            { error: 'Errore interno del server: ' + (error instanceof Error ? error.message : 'unknown') },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        // Estrai parametri dalla URL
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');
        const searchQuery = searchParams.get('q');
        const conditions = searchParams.get('condition'); // "COME_NUOVO,OTTIMO"
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const sortBy = searchParams.get('sort'); // recent, price_asc, price_desc

        // Costruisci la query base
        const whereClause: Prisma.ListingWhereInput = { 
            status: 'ATTIVO' 
        };

        // 🔍 FILTRO RICERCA (titolo, autore, ISBN)
        if (searchQuery) {
            whereClause.OR = [
                { book: { title: { contains: searchQuery } } },
                { book: { author: { contains: searchQuery } } },
                { book: { isbn: { contains: searchQuery } } }
            ];
        }

        // 🏷️ FILTRO CONDIZIONI
        if (conditions) {
            const conditionArray = conditions.split(',');
            whereClause.condition = {
                in: conditionArray
            };
        }

        // 💰 FILTRO PREZZO
        if (minPrice || maxPrice) {
            whereClause.price = {};
            
            if (minPrice) {
                whereClause.price.gte = parseFloat(minPrice);
            }
            
            if (maxPrice) {
                whereClause.price.lte = parseFloat(maxPrice);
            }
        }

        // 📊 ORDINAMENTO
        let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: 'desc' };
        
        if (sortBy) {
            switch(sortBy) {
                case 'price_asc':
                    orderBy = { price: 'asc' };
                    break;
                case 'price_desc':
                    orderBy = { price: 'desc' };
                    break;
                case 'recent':
                default:
                    orderBy = { createdAt: 'desc' };
                    break;
            }
        }

        // 📏 LIMITE (per homepage)
        const take = limit ? parseInt(limit) : undefined;

        console.log('🔍 Query filtri:', {
            searchQuery,
            conditions,
            minPrice,
            maxPrice,
            sortBy
        });

        const listings = await prisma.listing.findMany({
            where: whereClause,
            include: {
                book: true,
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy,
            take,
        });
        
        return NextResponse.json(listings);
        
    } catch (error) {
        console.error('Errore recupero annunci:', error);
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        );
    }
}
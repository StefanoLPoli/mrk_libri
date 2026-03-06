// app/api/listings/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// GET /api/listings/[id] - Recupera un singolo annuncio
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    
    // Verifica base
    if (!id) {
        console.log('❌ params.id è undefined o null');
        return NextResponse.json(
            { error: 'ID annuncio mancante' },
            { status: 400 }
        );
    }

    try {
        console.log('5️⃣ Cerco annuncio con ID:', id);
        
        const listing = await prisma.listing.findUnique({
            where: { id: id },
            include: { 
                book: true,
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        }); 

        console.log('6️⃣ Risultato query:', listing ? 'Trovato' : 'Non trovato');
        
        if (!listing) {
            return NextResponse.json(
                { error: 'Annuncio non trovato' },
                { status: 404 }
            );
        }

        console.log('7️⃣ Annuncio trovato:', listing.id);
        return NextResponse.json(listing);

    } catch (error) {
        console.error('❌ Errore:', error);
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        );
    }
}

// PATCH /api/listings/[id] - Aggiorna un annuncio
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Non autorizzato' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { price, condition, description, status: annuncioStatus } = body; // <- RINOMINATO per chiarezza

        // Verifica che l'annuncio appartenga all'utente
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        const existingListing = await prisma.listing.findUnique({
            where: { id: params.id }
        });

        if (!existingListing || existingListing.userId !== user?.id) {
            return NextResponse.json(
                { error: 'Non autorizzato' },
                { status: 403 }
            );
        }

        // Prepara i dati da aggiornare
        const updateData: any = {};
        
        if (price !== undefined) {
            updateData.price = parseFloat(price);
        }
        
        if (condition !== undefined) {
            updateData.condition = condition;
        }
        
        if (description !== undefined) {
            updateData.description = description;
        }
        
        if (annuncioStatus !== undefined) {  // <- AGGIUNTO: aggiorna lo status dell'annuncio
            updateData.status = annuncioStatus;
        }

        // Aggiorna l'annuncio
        const updatedListing = await prisma.listing.update({
            where: { id: params.id },
            data: updateData,
            include: { book: true }
        });

        return NextResponse.json(updatedListing);

    } catch (error) {
        console.error('Errore aggiornamento annuncio:', error);
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        );
    }
}

// DELETE /api/listings/[id] - Elimina un annuncio
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Non autorizzato' },
                { status: 401 }
            );
        }

        // Verifica che l'annuncio appartenga all'utente
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        const existingListing = await prisma.listing.findUnique({
            where: { id: params.id }
        });

        if (!existingListing || existingListing.userId !== user?.id) {
            return NextResponse.json(
                { error: 'Non autorizzato' },
                { status: 403 }
            );
        }

        // Elimina l'annuncio
        await prisma.listing.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Errore eliminazione annuncio:', error);
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        );
    }
}
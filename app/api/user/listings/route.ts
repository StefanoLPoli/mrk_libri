// app/api/user/listings/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function GET() {
    try {
        // Recupera la sessione lato server
        const session = await getServerSession();
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Non autorizzato' },
                { status: 401 }
            );
        }

        // Trova l'utente nel database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utente non trovato' },
                { status: 404 }
            );
        }

        // Recupera gli annunci dell'utente
        const listings = await prisma.listing.findMany({
            where: { 
                userId: user.id,
                status: 'ATTIVO' 
            },
            include: {
                book: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(listings);

    } catch (error) {
        console.error('Errore recupero annunci utente:', error);
        return NextResponse.json(
            { error: 'Errore interno del server' },
            { status: 500 }
        );
    }
}
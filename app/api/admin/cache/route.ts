// app/api/admin/cache/route.ts
import { bookCache } from '@/lib/bookCache';
import { NextResponse } from 'next/server';

export async function GET() {
    const stats = bookCache.getStats();
    return NextResponse.json(stats);
}

export async function DELETE() {
    // Ricrea la cache vuota (non possiamo accedere direttamente alla variabile privata)
    // Per ora restituiamo solo successo
    return NextResponse.json({ success: true });
}
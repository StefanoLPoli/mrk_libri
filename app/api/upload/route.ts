// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        
        if (!file) {
            return NextResponse.json({ error: 'Nessun file fornito' }, { status: 400 });
        }

        // Validazioni
        if (file.size > 5 * 1024 * 1024) { // 5MB max
            return NextResponse.json({ error: 'File troppo grande (max 5MB)' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Il file deve essere un\'immagine' }, { status: 400 });
        }

        // Crea nome file unico
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Crea cartella uploads se non esiste
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });
        
        // Salva file
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.name);
        const filename = `${uniqueSuffix}${ext}`;
        const filepath = path.join(uploadDir, filename);
        
        await writeFile(filepath, buffer);
        
        // Ritorna URL pubblico
        return NextResponse.json({ 
            url: `/uploads/${filename}`,
            message: 'Upload completato' 
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Errore durante l\'upload' }, { status: 500 });
    }
}
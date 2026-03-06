'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AnnunciPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;
        if (!session) {
            router.push('/auth/login?callbackUrl=/annunci');
        }
    }, [session, status, router]);

    if (status === 'loading') return <div>Caricamento...</div>;
    if (!session) return null;

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-light mb-8">Libri</h1>
            <p className="text-gray-600">
                Questa pagina è in costruzione. 
                <Link href="/user/annunci" className="text-black underline ml-2">
                    Vai alla gestione annunci
                </Link>
            </p>
        </div>
    );
}
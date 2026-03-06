// app/page.tsx
import Link from 'next/link';

export default function Home() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Hero section */}
            <div className="text-center mb-16">
                <h1 className="text-5xl font-light mb-4 tracking-tight">
                    Libri usati,<br />nuove storie
                </h1>
                <p className="text-midgray max-w-2xl mx-auto mb-8 text-lg">
                    Compra e vendi libri tra privati. Senza commissioni, senza complicazioni.
                </p>
                
                <Link
                    href="/vendi"
                    className="inline-block border-2 border-black px-8 py-3 text-lg font-medium hover:bg-black hover:text-white transition-colors"
                >
                    Vendi un libro
                </Link>
            </div>
            
            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card-hover p-6 bg-white">
                    <h3 className="text-xl font-medium mb-2">📖 Compra</h3>
                    <p className="text-darkgray mb-4">
                        Sfoglia migliaia di libri usati, dai classici ai libri scolastici.
                    </p>
                    <span className="text-sm border-b border-black pb-1">
                        Esplora il catalogo →
                    </span>
                </div>
                
                <div className="card-hover p-6 bg-white">
                    <h3 className="text-xl font-medium mb-2">💰 Vendi</h3>
                    <p className="text-darkgray mb-4">
                        Dai una seconda vita ai tuoi libri e guadagna qualcosa.
                    </p>
                    <span className="text-sm border-b border-black pb-1">
                        Pubblica un annuncio →
                    </span>
                </div>
                
                <div className="card-hover p-6 bg-white">
                    <h3 className="text-xl font-medium mb-2">🤝 Scambia</h3>
                    <p className="text-darkgray mb-4">
                        Contatta direttamente i venditori e organizza lo scambio.
                    </p>
                    <span className="text-sm border-b border-black pb-1">
                        Come funziona →
                    </span>
                </div>
            </div>
            
            {/* Sezione "Come funziona" */}
            <div className="mt-24 border-t border-lightgray pt-12">
                <h2 className="text-3xl font-light mb-8 text-center">In tre semplici passi</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                        <div className="text-4xl mb-2">1️⃣</div>
                        <h3 className="font-medium mb-2">Cerca il libro</h3>
                        <p className="text-sm text-midgray">Usa l'ISBN per trovare il libro che vuoi vendere</p>
                    </div>
                    <div>
                        <div className="text-4xl mb-2">2️⃣</div>
                        <h3 className="font-medium mb-2">Aggiungi i dettagli</h3>
                        <p className="text-sm text-midgray">Prezzo, condizioni e foto del tuo libro</p>
                    </div>
                    <div>
                        <div className="text-4xl mb-2">3️⃣</div>
                        <h3 className="font-medium mb-2">Pubblica e attendi</h3>
                        <p className="text-sm text-midgray">Gli acquirenti ti contatteranno direttamente</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
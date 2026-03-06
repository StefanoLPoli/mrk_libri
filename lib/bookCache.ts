import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.book-cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ore

interface CacheEntry {
    book: any;
    timestamp: number;
}

export class BookCache {
    private cache: Map<string, CacheEntry> = new Map();
    
    constructor() {
        this.loadFromDisk();
    }
    
    private loadFromDisk() {
        try {
            if (fs.existsSync(CACHE_FILE)) {
                const data = fs.readFileSync(CACHE_FILE, 'utf-8');
                const obj = JSON.parse(data);
                this.cache = new Map(Object.entries(obj));
                console.log(`📚 Cache caricata: ${this.cache.size} libri`);
            }
        } catch (error) {
            console.error('Errore caricamento cache:', error);
        }
    }
    
    private saveToDisk() {
        try {
            const obj = Object.fromEntries(this.cache);
            fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2));
        } catch (error) {
            console.error('Errore salvataggio cache:', error);
        }
    }
    
    get(isbn: string): any | null {
        const entry = this.cache.get(isbn);
        if (entry && (Date.now() - entry.timestamp) < CACHE_DURATION) {
            return entry.book;
        }
        return null;
    }
    
    set(isbn: string, book: any) {
        this.cache.set(isbn, {
            book,
            timestamp: Date.now()
        });
        this.saveToDisk();
    }
    
    getStats() {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.entries()).map(([isbn, entry]) => ({
                isbn,
                title: entry.book.title,
                cachedAt: new Date(entry.timestamp).toLocaleString()
            }))
        };
    }
}

// Esporta una singola istanza (singleton)
export const bookCache = new BookCache();

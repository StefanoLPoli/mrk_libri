// app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validazione base
      if (password.length < 6) {
        setError('La password deve essere almeno 6 caratteri');
        setLoading(false);
        return;
      }

      // Hash della password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Chiamata API per registrare l'utente
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: hashedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Errore durante la registrazione');
      } else {
        router.push('/auth/login?registered=true');
      }
    } catch (error) {
      setError('Errore durante la registrazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="border border-lightgray p-8">
        <h1 className="text-2xl font-light mb-6 text-center">Registrati</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-lightgray bg-white focus:outline-none focus:border-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-lightgray bg-white focus:outline-none focus:border-black"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-lightgray bg-white focus:outline-none focus:border-black"
              required
              minLength={6}
            />
            <p className="text-xs text-midgray mt-1">Minimo 6 caratteri</p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 hover:bg-darkgray transition-colors disabled:bg-lightgray"
          >
            {loading ? 'Registrazione...' : 'Registrati'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-lightgray"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-midgray">oppure</span>
          </div>
        </div>

        <div className="space-y-3">
          <button className="w-full border border-lightgray py-3 hover:bg-offwhite transition-colors flex items-center justify-center gap-2">
            Continua con Google
          </button>
          <button className="w-full border border-lightgray py-3 hover:bg-offwhite transition-colors flex items-center justify-center gap-2">
            Continua con Facebook
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-midgray">
          Hai già un account?{' '}
          <Link href="/auth/login" className="text-black underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
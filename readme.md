# Setup del progetto

## Prerequisiti
- Node.js **v22 LTS** (non v24)
- npm

## Primo avvio
1. `npm install`
2. Copia `.env.example` in `.env.local` e inserisci le variabili
3. `npx prisma generate`
4. `npx prisma migrate dev`
5. `npm run dev`

## Variabili d'ambiente necessarie
- DATABASE_URL
- GOOGLE_BOOKS_API_KEY
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- FACEBOOK_CLIENT_ID
- FACEBOOK_CLIENT_SECRET
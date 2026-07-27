# Aura Frontend

Premium React 19 + Vite + TypeScript frontend for the MERN Blog backend.

## Stack

- React 19, Vite, TypeScript, Tailwind CSS v4
- Framer Motion, TanStack Query, Zustand
- React Hook Form + Zod, Axios, React Router
- React Hot Toast, React Dropzone, Intersection Observer

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Ensure the backend runs on `http://localhost:8000` (or update `VITE_API_BASE_URL`).

## Scripts

- `npm run dev` — development server (proxies `/api` and `/images`)
- `npm run build` — production build
- `npm run preview` — preview production build

## API assumptions

All backend integration assumptions live in `src/config/api.ts`.

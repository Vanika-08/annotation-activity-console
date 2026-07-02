# Annotation Activity Console

A Next.js application for managing annotation tasks with live updates, filtering, search, sorting, and streamed task summaries.

## Features

- View annotation tasks in a paginated table
- Search, filter, and sort tasks
- Live task updates using WebSocket
- Stream task summaries using Server-Sent Events (SSE)
- Safe markdown rendering with HTML sanitization
- IndexedDB caching for faster reloads

## Tech Stack

- Next.js
- React
- TypeScript
- Redux Toolkit
- Tailwind CSS
- localForage
- react-markdown
- Jest
- React Testing Library

## Getting Started

Start the mock server:

```bash
cd mock-server
npm install
npm run mock
```

Start the frontend:

```bash
npm install
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Mock Server: http://localhost:4000

Environment variables can be configured in `.env.local`.

## Available Scripts

```bash
npm run dev
npm run build
npm start
npm test
npx tsc --noEmit
```

## Project Structure

```
app/              Next.js App Router
src/components/   UI components
src/hooks/        Custom hooks
src/lib/          API, cache, normalization helpers
src/store/        Redux Toolkit store and slices
src/types/        Type definitions
mock-server/      Mock REST, WebSocket and SSE server
buggy/            Bug fix exercise
```

## Notes

Additional implementation details and design decisions are available in `DECISIONS.md`.
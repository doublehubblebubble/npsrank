# Park Ranker - National Parks ELO Voting App

## Overview
An interactive web application for voting and ranking US National Parks using the chess ELO rating system. Users vote head-to-head between two random parks, and the app calculates rankings based on accumulated votes.

## Architecture
- **Frontend**: React + TypeScript with Vite, TanStack Query, Wouter routing, Shadcn UI, Framer Motion
- **Backend**: Express.js API with PostgreSQL (Drizzle ORM)
- **Styling**: Tailwind CSS with Shadcn components

## Key Features
- Head-to-head park matchups with beautiful park images
- ELO rating calculation (K-factor: 32)
- Live rankings table sorted by ELO
- Recent votes feed with ELO change indicators
- 10 seeded national parks with generated images

## Project Structure
- `shared/schema.ts` - Database schema (parks, votes tables) and TypeScript types
- `server/routes.ts` - API endpoints (/api/matchup, /api/rankings, /api/votes)
- `server/storage.ts` - Database storage layer with Drizzle ORM
- `server/seed.ts` - Seed data for 10 national parks
- `client/src/pages/home.tsx` - Main page component
- `client/src/components/matchup-card.tsx` - Head-to-head voting UI
- `client/src/components/rankings-table.tsx` - ELO rankings display
- `client/src/components/recent-votes.tsx` - Recent vote history feed

## API Endpoints
- `GET /api/matchup` - Get two random parks for voting
- `GET /api/rankings` - Get all parks sorted by ELO
- `GET /api/votes/recent` - Get 15 most recent votes with park details
- `POST /api/votes` - Submit a vote { winnerId, loserId }

## Running
- `npm run dev` starts the Express + Vite dev server on port 5000
- `npm run db:push` pushes schema changes to PostgreSQL

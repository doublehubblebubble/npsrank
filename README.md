# NPS Rank - National Parks ELO Voting App

An interactive web application that lets you rank all **63 US National Parks** using the chess ELO rating system. Vote in head-to-head matchups between random park pairs, and watch the rankings evolve based on community votes.

## Features

- **Head-to-Head Voting** - Two random parks are presented side-by-side; click on the one you prefer
- **ELO Rating System** - Rankings are calculated using the chess ELO algorithm (K-factor: 32) for fair, dynamic scoring
- **All 63 National Parks** - Complete coverage of every US national park with descriptions and photos sourced from Wikipedia
- **Live Rankings** - A real-time leaderboard sorted by ELO rating, showing rank changes after each vote
- **Recent Votes Feed** - See the latest votes with ELO change indicators for both winner and loser
- **Responsive Design** - Clean, minimal window-like UI with parks displayed side-by-side

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| UI Components | Shadcn UI, Framer Motion, Lucide Icons |
| State Management | TanStack Query |
| Routing | Wouter |
| Backend | Express.js (Node.js) |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Validation | Zod + drizzle-zod |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/matchup` | Get two random parks for voting |
| `GET` | `/api/rankings` | Get all parks sorted by ELO rating |
| `GET` | `/api/votes/recent` | Get the 15 most recent votes with park details |
| `POST` | `/api/votes` | Submit a vote (`{ winnerId, loserId }`) |

## Project Structure

```
├── client/                    # Frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── matchup-card.tsx     # Head-to-head voting UI
│   │   │   ├── rankings-table.tsx   # ELO rankings leaderboard
│   │   │   └── recent-votes.tsx     # Recent vote history feed
│   │   ├── pages/
│   │   │   └── home.tsx             # Main page
│   │   └── App.tsx
│   └── index.html
├── server/                    # Backend API
│   ├── routes.ts              # API endpoint handlers
│   ├── storage.ts             # Database operations (Drizzle ORM)
│   ├── seed.ts                # Seed data for all 63 national parks
│   └── index.ts               # Server entry point
├── shared/
│   └── schema.ts              # Database schema and TypeScript types
└── package.json
```

## Database Schema

**Parks** - Stores all 63 national parks with ELO ratings and vote statistics

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| name | text | Park name |
| state | text | State/territory |
| description | text | Park description |
| imageUrl | text | Wikipedia image URL |
| elo | real | Current ELO rating (default: 1500) |
| totalVotes | integer | Total votes received |
| wins | integer | Total wins |
| losses | integer | Total losses |
| previousRank | integer | Rank before last vote (for rank change tracking) |

**Votes** - Records every individual vote with ELO snapshots

| Column | Type | Description |
|--------|------|-------------|
| id | varchar (UUID) | Primary key |
| winnerId | varchar | FK to parks |
| loserId | varchar | FK to parks |
| winnerEloBefore / After | real | Winner's ELO before and after |
| loserEloBefore / After | real | Loser's ELO before and after |
| createdAt | timestamp | When the vote was cast |

## How ELO Works

Each park starts at an ELO rating of **1500**. When a vote is cast:

1. The **expected score** for each park is calculated based on their current ratings
2. The winner's rating increases and the loser's decreases
3. The magnitude of change depends on the difference in ratings - an upset (lower-rated park beating a higher-rated one) produces a bigger swing
4. A **K-factor of 32** controls the maximum possible change per vote

## Getting Started

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start the development server
npm run dev
```

The app runs on `http://localhost:5000`.

## License

MIT

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const parks = pgTable("parks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  state: text("state").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  elo: real("elo").notNull().default(1500),
  totalVotes: integer("total_votes").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  previousRank: integer("previous_rank").notNull().default(0),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  winnerId: varchar("winner_id").notNull().references(() => parks.id),
  loserId: varchar("loser_id").notNull().references(() => parks.id),
  winnerEloBefore: real("winner_elo_before").notNull(),
  loserEloBefore: real("loser_elo_before").notNull(),
  winnerEloAfter: real("winner_elo_after").notNull(),
  loserEloAfter: real("loser_elo_after").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertParkSchema = createInsertSchema(parks).omit({
  id: true,
  elo: true,
  totalVotes: true,
  wins: true,
  losses: true,
  previousRank: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const submitVoteSchema = z.object({
  winnerId: z.string(),
  loserId: z.string(),
});

export type InsertPark = z.infer<typeof insertParkSchema>;
export type Park = typeof parks.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export type VoteWithParks = Vote & {
  winner: Park;
  loser: Park;
};

export type Matchup = {
  park1: Park;
  park2: Park;
};

export type RankedPark = Park & {
  rank: number;
  rankChange: number;
};

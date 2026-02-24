import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  parks, votes,
  type Park, type InsertPark, type Vote, type VoteWithParks, type Matchup
} from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export interface IStorage {
  getAllParks(): Promise<Park[]>;
  getParkById(id: string): Promise<Park | undefined>;
  getRankings(): Promise<Park[]>;
  getRandomMatchup(): Promise<Matchup>;
  createPark(park: InsertPark): Promise<Park>;
  updateParkElo(id: string, elo: number, won: boolean): Promise<void>;
  createVote(vote: {
    winnerId: string;
    loserId: string;
    winnerEloBefore: number;
    loserEloBefore: number;
    winnerEloAfter: number;
    loserEloAfter: number;
  }): Promise<Vote>;
  getRecentVotes(limit?: number): Promise<VoteWithParks[]>;
  getParkCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getAllParks(): Promise<Park[]> {
    return db.select().from(parks);
  }

  async getParkById(id: string): Promise<Park | undefined> {
    const result = await db.select().from(parks).where(eq(parks.id, id));
    return result[0];
  }

  async getRankings(): Promise<Park[]> {
    return db.select().from(parks).orderBy(desc(parks.elo));
  }

  async getRandomMatchup(): Promise<Matchup> {
    const allParks = await db.select().from(parks).orderBy(sql`RANDOM()`).limit(2);
    if (allParks.length < 2) {
      throw new Error("Not enough parks for a matchup");
    }
    return { park1: allParks[0], park2: allParks[1] };
  }

  async createPark(park: InsertPark): Promise<Park> {
    const result = await db.insert(parks).values(park).returning();
    return result[0];
  }

  async updateParkElo(id: string, elo: number, won: boolean): Promise<void> {
    if (won) {
      await db.update(parks).set({
        elo,
        totalVotes: sql`${parks.totalVotes} + 1`,
        wins: sql`${parks.wins} + 1`,
      }).where(eq(parks.id, id));
    } else {
      await db.update(parks).set({
        elo,
        totalVotes: sql`${parks.totalVotes} + 1`,
        losses: sql`${parks.losses} + 1`,
      }).where(eq(parks.id, id));
    }
  }

  async saveCurrentRanks(): Promise<void> {
    const ranked = await this.getRankings();
    for (let i = 0; i < ranked.length; i++) {
      await db.update(parks).set({ previousRank: i + 1 }).where(eq(parks.id, ranked[i].id));
    }
  }

  async initializeRanks(): Promise<void> {
    const anyPark = await db.select().from(parks).limit(1);
    if (anyPark.length > 0 && anyPark[0].previousRank === 0) {
      await this.saveCurrentRanks();
    }
  }

  async createVote(vote: {
    winnerId: string;
    loserId: string;
    winnerEloBefore: number;
    loserEloBefore: number;
    winnerEloAfter: number;
    loserEloAfter: number;
  }): Promise<Vote> {
    const result = await db.insert(votes).values(vote).returning();
    return result[0];
  }

  async getRecentVotes(limit = 10): Promise<VoteWithParks[]> {
    const recentVotes = await db
      .select()
      .from(votes)
      .orderBy(desc(votes.createdAt))
      .limit(limit);

    const result: VoteWithParks[] = [];
    for (const vote of recentVotes) {
      const winner = await this.getParkById(vote.winnerId);
      const loser = await this.getParkById(vote.loserId);
      if (winner && loser) {
        result.push({ ...vote, winner, loser });
      }
    }
    return result;
  }

  async getParkCount(): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` }).from(parks);
    return Number(result[0].count);
  }
}

export const storage = new DatabaseStorage();

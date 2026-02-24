import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { submitVoteSchema } from "@shared/schema";
import { seedParks } from "./seed";

const K_FACTOR = 32;

function calculateElo(winnerElo: number, loserElo: number): { newWinnerElo: number; newLoserElo: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  const newWinnerElo = winnerElo + K_FACTOR * (1 - expectedWinner);
  const newLoserElo = loserElo + K_FACTOR * (0 - expectedLoser);

  return { newWinnerElo, newLoserElo };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedParks();
  await storage.initializeRanks();

  app.get("/api/matchup", async (_req, res) => {
    try {
      const matchup = await storage.getRandomMatchup();
      res.json(matchup);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/rankings", async (_req, res) => {
    try {
      const rankings = await storage.getRankings();
      const rankedParks = rankings.map((park, index) => {
        const currentRank = index + 1;
        const rankChange = park.previousRank > 0 ? park.previousRank - currentRank : 0;
        return { ...park, rank: currentRank, rankChange };
      });
      res.json(rankedParks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/votes/recent", async (_req, res) => {
    try {
      const recentVotes = await storage.getRecentVotes(15);
      res.json(recentVotes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/votes", async (req, res) => {
    try {
      const parsed = submitVoteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid vote data" });
      }

      const { winnerId, loserId } = parsed.data;

      if (winnerId === loserId) {
        return res.status(400).json({ message: "Cannot vote for the same park" });
      }

      const winner = await storage.getParkById(winnerId);
      const loser = await storage.getParkById(loserId);

      if (!winner || !loser) {
        return res.status(404).json({ message: "Park not found" });
      }

      const { newWinnerElo, newLoserElo } = calculateElo(winner.elo, loser.elo);

      await storage.saveCurrentRanks();

      await storage.updateParkElo(winnerId, newWinnerElo, true);
      await storage.updateParkElo(loserId, newLoserElo, false);

      const vote = await storage.createVote({
        winnerId,
        loserId,
        winnerEloBefore: winner.elo,
        loserEloBefore: loser.elo,
        winnerEloAfter: newWinnerElo,
        loserEloAfter: newLoserElo,
      });

      res.json(vote);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}

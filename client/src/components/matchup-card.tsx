import { Badge } from "@/components/ui/badge";
import { TreePine, TrendingUp } from "lucide-react";
import type { Matchup, Park, RankedPark } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MatchupCardProps {
  matchup: Matchup;
  onVote: (winnerId: string, loserId: string) => void;
  isVoting: boolean;
  votedParkId: string | null;
  rankings: RankedPark[];
}

function ParkPanel({
  park,
  opponent,
  onVote,
  isVoting,
  votedParkId,
  rank,
}: {
  park: Park;
  opponent: Park;
  onVote: (winnerId: string, loserId: string) => void;
  isVoting: boolean;
  votedParkId: string | null;
  rank: number;
}) {
  const isWinner = votedParkId === park.id;
  const isLoser = votedParkId === opponent.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{
        opacity: isLoser ? 0.5 : 1,
        y: 0,
        scale: isWinner ? 1.02 : isLoser ? 0.98 : 1,
      }}
      transition={{ duration: 0.25 }}
      className="h-full"
    >
      <button
        onClick={() => {
          if (!isVoting && !votedParkId) {
            onVote(park.id, opponent.id);
          }
        }}
        disabled={isVoting || !!votedParkId}
        className={cn(
          "w-full h-full text-left rounded-lg border border-border bg-card p-4 transition-all duration-200 cursor-pointer flex flex-col",
          isWinner && "ring-2 ring-primary border-primary",
          !isVoting && !votedParkId && "hover-elevate"
        )}
        data-testid={`button-park-${park.id}`}
      >
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center shrink-0 mt-0.5">
            {park.imageUrl ? (
              <img src={park.imageUrl} alt={park.name} className="w-full h-full object-cover rounded-md" data-testid={`img-park-${park.id}`} />
            ) : (
              <TreePine className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-base leading-tight" data-testid={`text-park-name-${park.id}`}>{park.name}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground" data-testid={`text-park-state-${park.id}`}>{park.state}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          {park.totalVotes > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 no-default-active-elevate" data-testid={`badge-trending-${park.id}`}>
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
              Trending
            </Badge>
          )}
          {rank > 0 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 no-default-active-elevate" data-testid={`badge-rank-${park.id}`}>
              rank #{rank}
            </Badge>
          )}
        </div>

        <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1" data-testid={`text-park-desc-${park.id}`}>
          {park.description}
        </p>

        {isWinner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-2.5 text-center"
          >
            <Badge className="no-default-active-elevate">Selected</Badge>
          </motion.div>
        )}
      </button>
    </motion.div>
  );
}

export function MatchupCard({ matchup, onVote, isVoting, votedParkId, rankings }: MatchupCardProps) {
  const getRank = (parkId: string) => {
    const found = rankings.find(p => p.id === parkId);
    return found ? found.rank : 0;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${matchup.park1.id}-${matchup.park2.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        data-testid="matchup-container"
      >
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4 items-stretch">
          <ParkPanel
            park={matchup.park1}
            opponent={matchup.park2}
            onVote={onVote}
            isVoting={isVoting}
            votedParkId={votedParkId}
            rank={getRank(matchup.park1.id)}
          />

          <div className="flex items-center justify-center">
            <span className="text-base sm:text-xl font-bold text-muted-foreground select-none" data-testid="text-vs">vs</span>
          </div>

          <ParkPanel
            park={matchup.park2}
            opponent={matchup.park1}
            onVote={onVote}
            isVoting={isVoting}
            votedParkId={votedParkId}
            rank={getRank(matchup.park2.id)}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

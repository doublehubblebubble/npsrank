import { Skeleton } from "@/components/ui/skeleton";
import { Clock, TrendingUp, TrendingDown, TreePine } from "lucide-react";
import type { VoteWithParks } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RecentVotesProps {
  votes: VoteWithParks[];
  isLoading: boolean;
}

function EloChange({ before, after }: { before: number; after: number }) {
  const diff = Math.round(after - before);
  const isPositive = diff > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
      {isPositive ? (
        <TrendingUp className="w-2.5 h-2.5" />
      ) : (
        <TrendingDown className="w-2.5 h-2.5" />
      )}
      {isPositive ? "+" : ""}{diff}
    </span>
  );
}

export function RecentVotes({ votes, isLoading }: RecentVotesProps) {
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">recent votes</h3>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4" data-testid="text-recent-heading">recent votes</h3>
      {votes.length === 0 ? (
        <div className="border border-border rounded-lg p-8 text-center">
          <Clock className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground" data-testid="text-empty-votes">No votes yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2" data-testid="recent-votes-list">
          {votes.map((vote) => (
            <div
              key={vote.id}
              className="border border-border rounded-lg p-3"
              data-testid={`vote-item-${vote.id}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded overflow-hidden bg-accent flex items-center justify-center shrink-0">
                  {vote.winner.imageUrl ? (
                    <img src={vote.winner.imageUrl} alt={vote.winner.name} className="w-full h-full object-cover" />
                  ) : (
                    <TreePine className="w-2.5 h-2.5 text-primary" />
                  )}
                </div>
                <span className="text-sm font-medium truncate" data-testid={`text-winner-name-${vote.id}`}>{vote.winner.name}</span>
                <EloChange before={vote.winnerEloBefore} after={vote.winnerEloAfter} />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded overflow-hidden bg-accent flex items-center justify-center shrink-0 opacity-50">
                  {vote.loser.imageUrl ? (
                    <img src={vote.loser.imageUrl} alt={vote.loser.name} className="w-full h-full object-cover" />
                  ) : (
                    <TreePine className="w-2.5 h-2.5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate" data-testid={`text-loser-name-${vote.id}`}>{vote.loser.name}</span>
                <EloChange before={vote.loserEloBefore} after={vote.loserEloAfter} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5" data-testid={`text-vote-time-${vote.id}`}>
                {formatDistanceToNow(new Date(vote.createdAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

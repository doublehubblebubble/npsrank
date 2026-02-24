import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { MatchupCard } from "@/components/matchup-card";
import { RankingsTable } from "@/components/rankings-table";
import { RecentVotes } from "@/components/recent-votes";
import { Skeleton } from "@/components/ui/skeleton";
import { TreePine } from "lucide-react";
import type { Matchup, RankedPark, VoteWithParks } from "@shared/schema";
import { useState } from "react";

export default function Home() {
  const { toast } = useToast();
  const [votedParkId, setVotedParkId] = useState<string | null>(null);

  const { data: matchup, isLoading: matchupLoading } = useQuery<Matchup>({
    queryKey: ["/api/matchup"],
  });

  const { data: rankings, isLoading: rankingsLoading } = useQuery<RankedPark[]>({
    queryKey: ["/api/rankings"],
  });

  const { data: recentVotes, isLoading: votesLoading } = useQuery<VoteWithParks[]>({
    queryKey: ["/api/votes/recent"],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ winnerId, loserId }: { winnerId: string; loserId: string }) => {
      const res = await apiRequest("POST", "/api/votes", { winnerId, loserId });
      return res.json();
    },
    onSuccess: () => {
      setTimeout(() => {
        setVotedParkId(null);
        queryClient.invalidateQueries({ queryKey: ["/api/matchup"] });
        queryClient.invalidateQueries({ queryKey: ["/api/rankings"] });
        queryClient.invalidateQueries({ queryKey: ["/api/votes/recent"] });
      }, 600);
    },
    onError: (error: Error) => {
      setVotedParkId(null);
      toast({
        title: "Vote failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVote = (winnerId: string, loserId: string) => {
    setVotedParkId(winnerId);
    voteMutation.mutate({ winnerId, loserId });
  };

  return (
    <div className="min-h-screen bg-muted/30 dark:bg-background flex items-start justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl bg-background border border-border rounded-2xl shadow-sm overflow-hidden">
        <header className="flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight" data-testid="text-app-title">nps rank</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
          </div>
        </header>

        <div className="px-6 py-6">
          <section className="mb-8">
            <h2 className="text-center text-lg sm:text-xl font-semibold tracking-tight mb-5" data-testid="text-matchup-heading">
              Which park would you rather visit?
            </h2>
            {matchupLoading ? (
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
                <Skeleton className="h-48 rounded-lg" />
                <div className="flex items-center justify-center px-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
                <Skeleton className="h-48 rounded-lg" />
              </div>
            ) : matchup ? (
              <MatchupCard
                matchup={matchup}
                onVote={handleVote}
                isVoting={voteMutation.isPending}
                votedParkId={votedParkId}
                rankings={rankings ?? []}
              />
            ) : null}
          </section>

          <section className="mb-8">
            <RankingsTable parks={rankings ?? []} isLoading={rankingsLoading} />
          </section>

          <section>
            <RecentVotes votes={recentVotes ?? []} isLoading={votesLoading} />
          </section>
        </div>
      </div>
    </div>
  );
}

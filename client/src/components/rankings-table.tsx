import { Skeleton } from "@/components/ui/skeleton";
import { TreePine, ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { RankedPark } from "@shared/schema";
import { cn } from "@/lib/utils";

interface RankingsTableProps {
  parks: RankedPark[];
  isLoading: boolean;
}

function RankChangeIndicator({ rankChange, parkId }: { rankChange: number; parkId: string }) {
  if (rankChange === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm text-muted-foreground" data-testid={`text-change-${parkId}`}>
        <Minus className="w-3.5 h-3.5" />0
      </span>
    );
  }
  if (rankChange > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-sm text-green-600 dark:text-green-400 font-semibold" data-testid={`text-change-${parkId}`}>
        <ArrowUp className="w-3.5 h-3.5" />{rankChange}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-sm text-red-500 dark:text-red-400 font-semibold" data-testid={`text-change-${parkId}`}>
      <ArrowDown className="w-3.5 h-3.5" />{Math.abs(rankChange)}
    </span>
  );
}

export function RankingsTable({ parks, isLoading }: RankingsTableProps) {
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-semibold mb-4">rankings</h3>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="border border-border rounded-lg overflow-hidden" data-testid="rankings-list">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-sm font-semibold px-5 py-3 w-full" data-testid="text-rankings-heading">rankings</th>
              <th className="text-right text-sm font-semibold px-5 py-3 whitespace-nowrap">score</th>
              <th className="text-right text-sm font-semibold px-5 py-3 whitespace-nowrap">change</th>
            </tr>
          </thead>
          <tbody>
            {parks.map((park) => (
              <tr
                key={park.id}
                className="border-t border-border"
                data-testid={`ranking-item-${park.id}`}
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground w-5 text-right shrink-0" data-testid={`text-rank-${park.id}`}>
                      {park.rank}
                    </span>
                    <div className="w-7 h-7 rounded overflow-hidden bg-accent flex items-center justify-center shrink-0">
                      {park.imageUrl ? (
                        <img
                          src={park.imageUrl}
                          alt={park.name}
                          className="w-full h-full object-cover"
                          data-testid={`img-ranking-${park.id}`}
                        />
                      ) : (
                        <TreePine className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                    <span className="text-sm font-semibold truncate" data-testid={`text-ranking-name-${park.id}`}>
                      {park.name}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="text-sm font-bold font-mono" data-testid={`text-score-${park.id}`}>
                    {Math.round(park.elo)}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <RankChangeIndicator rankChange={park.rankChange} parkId={park.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

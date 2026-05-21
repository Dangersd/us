import StatCardShell from "~components/widgets/profile/stats/StatCardShell";
import type { CoupleStats } from "~interfaces/stats";
import { cn } from "~libs/utils";

export interface TopPlacesCardProps {
    places: CoupleStats["topPlaces"];
}

const TopPlacesCard = ({ places }: TopPlacesCardProps) => {
    if (places.length === 0) {
        return (
            <StatCardShell title="Места">
                <span className={cn("text-sm italic text-ink-muted")}>
                    Когда соберёшь места — увидишь здесь
                </span>
            </StatCardShell>
        );
    }

    return (
        <StatCardShell title="Места">
            <ol className={cn("flex flex-col gap-1.5")}>
                {places.map((p, idx) => (
                    <li
                        key={`${p.name}-${idx}`}
                        className={cn("flex items-baseline gap-2")}
                    >
                        <span
                            className={cn(
                                "font-display text-xl text-ink-primary",
                            )}
                        >
                            {p.name}
                        </span>
                        <span
                            className={cn(
                                "text-xs text-ink-muted tabular-nums",
                            )}
                        >
                            ×{p.count}
                        </span>
                    </li>
                ))}
            </ol>
        </StatCardShell>
    );
};

export default TopPlacesCard;

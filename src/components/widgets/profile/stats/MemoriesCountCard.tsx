import StatCardShell from "~components/widgets/profile/stats/StatCardShell";
import { cn } from "~libs/utils";

export interface MemoriesCountCardProps {
    count: number;
}

const pluralizeMoments = (n: number): string => {
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return "момент";
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return "момента";
    return "моментов";
};

const MemoriesCountCard = ({ count }: MemoriesCountCardProps) => {
    if (count <= 0) {
        return (
            <StatCardShell title="Воспоминания">
                <span className={cn("text-sm italic text-ink-muted")}>
                    Memory of the day копится
                </span>
            </StatCardShell>
        );
    }

    const noun = pluralizeMoments(count);

    return (
        <StatCardShell title="Воспоминания">
            <div className={cn("flex items-baseline gap-2")}>
                <span className={cn("font-display text-5xl text-ink-primary")}>
                    {count}
                </span>
                <span className={cn("text-xs text-ink-muted")}>{noun}</span>
            </div>
        </StatCardShell>
    );
};

export default MemoriesCountCard;

import StatCardShell from "~components/widgets/profile/stats/StatCardShell";
import { pluralizeRu } from "~libs/ru-pluralize";
import { cn } from "~libs/utils";

export interface MemoriesCountCardProps {
    count: number;
}

const MOMENT_FORMS = ["момент", "момента", "моментов"] as const;

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

    const noun = pluralizeRu(count, MOMENT_FORMS);

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

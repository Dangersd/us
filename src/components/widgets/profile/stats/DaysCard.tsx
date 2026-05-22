import StatCardShell from "~components/widgets/profile/stats/StatCardShell";
import { pluralizeDays } from "~libs/ru-pluralize";
import { cn } from "~libs/utils";

export interface DaysCardProps {
    acquaintedDays: number | null;
    togetherDays: number | null;
}

const DaysCard = ({ acquaintedDays, togetherDays }: DaysCardProps) => {
    const hasAcq = acquaintedDays !== null && acquaintedDays > 0;
    const hasTogether = togetherDays !== null && togetherDays > 0;

    if (!hasAcq && !hasTogether) {
        return (
            <StatCardShell title="Дни">
                <span className={cn("text-sm italic text-ink-muted")}>
                    Добавь важные даты — посчитаем
                </span>
            </StatCardShell>
        );
    }

    return (
        <StatCardShell title="Дни">
            <div className={cn("flex w-full flex-col gap-8 items-baseline")}>
                {hasAcq ? (
                    <div className={cn("flex text-start w-full flex-col")}>
                        <span
                            className={cn(
                                "font-display text-5xl text-ink-primary",
                            )}
                        >
                            {acquaintedDays}
                        </span>
                        <span className={cn("text-xs text-ink-muted")}>
                            {pluralizeDays(acquaintedDays as number)} знакомы
                        </span>
                    </div>
                ) : null}
                {hasTogether ? (
                    <div className={cn("flex text-start w-full flex-col")}>
                        <span
                            className={cn(
                                "font-display text-5xl text-ink-primary",
                            )}
                        >
                            {togetherDays}
                        </span>
                        <span className={cn("text-xs text-ink-muted")}>
                            {pluralizeDays(togetherDays as number)} вместе
                        </span>
                    </div>
                ) : null}
            </div>
        </StatCardShell>
    );
};

export default DaysCard;

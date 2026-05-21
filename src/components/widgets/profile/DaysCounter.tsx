import { pluralizeDays } from "~libs/ru-pluralize";
import { cn } from "~libs/utils";

// «N дней знакомы · M дней вместе» — Fraunces serif под парой blob'ов.
// Чистая презентация: считает caller, передаёт через props.
//
// Когда одна из дат null/0 — сегмент не рендерим (а не «0 дней»), чтобы не
// давить на пустоту: пусть пользователь увидит CTA в ImportantDatesSection
// ниже и заполнит даты сам.

export interface DaysCounterProps {
    acquaintedDays: number | null;
    togetherDays: number | null;
    className?: string;
}

const DaysCounter = ({
    acquaintedDays,
    togetherDays,
    className,
}: DaysCounterProps) => {
    const segments: string[] = [];
    if (acquaintedDays !== null && acquaintedDays > 0) {
        segments.push(
            `${acquaintedDays} ${pluralizeDays(acquaintedDays)} знакомы`,
        );
    }
    if (togetherDays !== null && togetherDays > 0) {
        segments.push(`${togetherDays} ${pluralizeDays(togetherDays)} вместе`);
    }

    if (segments.length === 0) return null;

    return (
        <p
            className={cn(
                "font-display text-ink-secondary text-center text-base tracking-wide",
                className,
            )}
        >
            {segments.join(" · ")}
        </p>
    );
};

export default DaysCounter;

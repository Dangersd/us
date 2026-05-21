"use client";

import { tv } from "tailwind-variants";

import Button from "~components/ui/Button";
import { useOpenImportantDatesModal } from "~components/widgets/profile/useOpenImportantDatesModal";
import type { Couple } from "~interfaces/couple";
import type { AppUser } from "~interfaces/user";
import { formatRuFullDate } from "~libs/date";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-3 py-4"),
        title: cn(
            "text-[11px] uppercase tracking-wider text-ink-muted",
            "px-1",
        ),
        list: cn("flex flex-col gap-2"),
        row: cn(
            "flex items-center justify-between gap-3",
            "rounded-xl bg-bg-surface-1 px-4 py-3",
        ),
        rowLabel: cn("text-sm text-ink-secondary"),
        rowValue: cn("text-sm text-ink-primary tabular-nums"),
        rowValueEmpty: cn("text-sm text-ink-muted italic"),
        footer: cn("flex justify-end pt-1"),
    },
});

export interface ImportantDatesSectionProps {
    me: AppUser;
    partner: AppUser | null;
    couple: Couple | null;
    className?: string;
}

const ImportantDatesSection = ({
    me,
    partner,
    couple,
    className,
}: ImportantDatesSectionProps) => {
    const {
        root,
        title,
        list,
        row,
        rowLabel,
        rowValue,
        rowValueEmpty,
        footer,
    } = styles();
    const openModal = useOpenImportantDatesModal();

    const rows: Array<{ label: string; value: string | null }> = [
        {
            label: "Знакомство",
            value: formatRuFullDate(couple?.acquaintanceDate ?? null),
        },
        {
            label: "Начало отношений",
            value: formatRuFullDate(couple?.relationshipStartDate ?? null),
        },
        { label: "Мой день рождения", value: formatRuFullDate(me.birthday) },
        {
            label: partner
                ? `День рождения ${partner.displayName}`
                : "День рождения партнёра",
            value: formatRuFullDate(partner?.birthday ?? null),
        },
    ];

    return (
        <section className={cn(root(), className)}>
            <h2 className={title()}>Важные даты</h2>
            <ul className={list()}>
                {rows.map((r) => (
                    <li key={r.label} className={row()}>
                        <span className={rowLabel()}>{r.label}</span>
                        <span
                            className={r.value ? rowValue() : rowValueEmpty()}
                        >
                            {r.value ?? "не указано"}
                        </span>
                    </li>
                ))}
            </ul>
            <div className={footer()}>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={openModal}
                >
                    Редактировать
                </Button>
            </div>
        </section>
    );
};

export default ImportantDatesSection;

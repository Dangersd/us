import type { ReactNode } from "react";

import { tv } from "tailwind-variants";

import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn(
            "flex min-h-[120px] flex-col gap-2",
            "rounded-2xl bg-bg-surface-1 px-4 py-4",
        ),
        title: cn("text-[11px] uppercase tracking-wider text-ink-muted"),
        body: cn("flex flex-1 flex-col justify-center"),
    },
});

export interface StatCardShellProps {
    title: string;
    children: ReactNode;
    className?: string;
}

const StatCardShell = ({ title, children, className }: StatCardShellProps) => {
    const { root, title: titleCls, body } = styles();
    return (
        <article className={cn(root(), className)}>
            <h3 className={titleCls()}>{title}</h3>
            <div className={body()}>{children}</div>
        </article>
    );
};

export default StatCardShell;

import { tv } from "tailwind-variants";

import Container from "~components/layout/Container";
import { cn } from "~libs/utils";

// Suspense fallback для всех (rooms)/* routes. Sidebar/TopBar/BottomNav
// рендерятся (rooms)/layout.tsx → AppShell и остаются на месте между
// навигациями; этот компонент покрывает только <main> контентную область.
//
// Дизайн нейтральный: не пытаемся повторить геометрию конкретной комнаты —
// показываем серию пульсирующих блоков, которые подсказывают «контент сейчас
// будет». pulse уже встроен в Tailwind (`animate-pulse`).

const styles = tv({
    slots: {
        section: cn(
            "relative flex-1",
            "pt-4 pb-20 md:pt-8 md:pb-8",
            "motion-safe:animate-pulse",
        ),
        stack: cn("flex w-full flex-col gap-6 py-2 md:py-4"),
        headerBlock: cn(
            "h-10 w-3/4 max-w-md rounded-md bg-bg-surface-1",
            "md:h-12",
        ),
        primaryCard: cn("h-48 w-full rounded-lg bg-bg-surface-1", "md:h-64"),
        rowGrid: cn("grid grid-cols-1 gap-4", "md:grid-cols-2 md:gap-6"),
        smallCard: cn("h-32 w-full rounded-lg bg-bg-surface-1", "md:h-40"),
        wideCard: cn("h-24 w-full rounded-lg bg-bg-surface-1", "md:h-32"),
    },
});

const RoomsLoading = () => {
    const s = styles();
    return (
        <section aria-label="Загрузка" aria-busy="true" className={s.section()}>
            <Container size="md">
                <div className={s.stack()}>
                    <div className={s.headerBlock()} />
                    <div className={s.primaryCard()} />
                    <div className={s.rowGrid()}>
                        <div className={s.smallCard()} />
                        <div className={s.smallCard()} />
                    </div>
                    <div className={s.wideCard()} />
                </div>
            </Container>
        </section>
    );
};

export default RoomsLoading;

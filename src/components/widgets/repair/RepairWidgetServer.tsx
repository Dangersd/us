import type { ReactNode } from "react";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";

import "server-only";

import { makeQueryClient } from "~libs/react-query/query-client";
import { createFetchActiveEpisodeServerQuery } from "~queries/repair/fetch-active-episode.server";

// Wraps repair-зависимые слоты Home (active + empty) одной HydrationBoundary.
// На Home мы рендерим RepairWidget дважды (slot="active" сверху, slot="empty"
// снизу) — обе client-инстанции читают из одного query cache, поэтому prefetch
// нужен только один. children — это вся часть дерева, которая использует
// useActiveEpisode под капотом.

interface RepairWidgetServerProps {
    children: ReactNode;
}

const RepairWidgetServer = async ({ children }: RepairWidgetServerProps) => {
    const queryClient = makeQueryClient();
    await queryClient
        .prefetchQuery(createFetchActiveEpisodeServerQuery())
        .catch(() => undefined);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
};

export default RepairWidgetServer;

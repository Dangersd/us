"use client";

import { type ReactNode, useState } from "react";

import {
    type QueryClient,
    QueryClientProvider,
    isServer,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";

import { makeQueryClient } from "~libs/react-query/query-client";

let browserClient: QueryClient | undefined;
function getQueryClient() {
    if (isServer) return makeQueryClient();
    if (!browserClient) browserClient = makeQueryClient();
    return browserClient;
}

const Providers = ({ children }: { children: ReactNode }) => {
    const [client] = useState(() => getQueryClient());

    return (
        <QueryClientProvider client={client}>
            <ReactQueryStreamedHydration>
                {children}
            </ReactQueryStreamedHydration>
            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </QueryClientProvider>
    );
};

export default Providers;

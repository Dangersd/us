"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchCurrentUser } from "~queries/user/fetch-current-user";
import { userKeys } from "~queries/user/keys";

export function useCurrentUser() {
    return useQuery({
        queryKey: userKeys.current(),
        queryFn: fetchCurrentUser,
        staleTime: 60_000,
    });
}

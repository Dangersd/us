"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchCurrentUserQuery } from "~queries/user/fetch-current-user";

export function useCurrentUser() {
    return useQuery(createFetchCurrentUserQuery());
}

"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchMyPhaseQuery } from "~queries/cycle/fetch-my-phase";

export function useMyPhase() {
    return useQuery(createFetchMyPhaseQuery());
}

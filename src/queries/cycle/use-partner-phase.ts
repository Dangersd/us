"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchPartnerPhaseQuery } from "~queries/cycle/fetch-partner-phase";

export function usePartnerPhase() {
    return useQuery(createFetchPartnerPhaseQuery());
}

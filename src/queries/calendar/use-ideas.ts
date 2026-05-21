"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchIdeasQuery } from "~queries/calendar/fetch-ideas";

export function useIdeas() {
    return useQuery(createFetchIdeasQuery());
}

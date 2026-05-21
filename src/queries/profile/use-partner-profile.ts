"use client";

import { useQuery } from "@tanstack/react-query";

import { createFetchPartnerProfileQuery } from "~queries/profile/fetch-partner-profile";

export function usePartnerProfile() {
    return useQuery(createFetchPartnerProfileQuery());
}

"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPartnerProfile } from "~queries/profile/fetch-partner-profile";
import { profileKeys } from "~queries/profile/keys";

export function usePartnerProfile() {
    return useQuery({
        queryKey: profileKeys.partner(),
        queryFn: fetchPartnerProfile,
        staleTime: 5 * 60_000,
    });
}

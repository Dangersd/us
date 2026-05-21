"use client";

import { useContext } from "react";

import { SoftToastContext } from "~components/ui/soft-toast/SoftToastContext";

export function useSoftToast() {
    const ctx = useContext(SoftToastContext);
    if (!ctx) {
        throw new Error(
            "useSoftToast must be used within <SoftToastProvider> (см. Providers.tsx)",
        );
    }
    return ctx;
}

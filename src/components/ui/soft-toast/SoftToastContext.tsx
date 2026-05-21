"use client";

import { createContext } from "react";

export interface SoftToastInput {
    title: string;
    description?: string;
}

export interface SoftToastContextValue {
    showToast: (input: SoftToastInput) => void;
}

export const SoftToastContext = createContext<SoftToastContextValue | null>(
    null,
);

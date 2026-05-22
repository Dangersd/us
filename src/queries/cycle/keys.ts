// Query keys factory для cycle-домена. Иерархия:
//   cycle/
//   ├─ month/<ym>           — useCycleMonth (для cycle grid + calendar overlay)
//   ├─ today/<date>         — useCycleToday (для Mood checkin prefetch — D2)
//   ├─ history/<days>       — useCycleHistory (для compute-stats)
//   ├─ my-phase             — useMyPhase (фаза + день, через compute_my_phase RPC)
//   └─ partner-phase        — usePartnerPhase (ambient ring, через get_partner_phase)
export const cycleKeys = {
    all: ["cycle"] as const,
    month: (ym: string) => [...cycleKeys.all, "month", ym] as const,
    today: (date: string) => [...cycleKeys.all, "today", date] as const,
    history: (days: number) => [...cycleKeys.all, "history", days] as const,
    myPhase: () => [...cycleKeys.all, "my-phase"] as const,
    partnerPhase: () => [...cycleKeys.all, "partner-phase"] as const,
};

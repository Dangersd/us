import type {
    RepairAvailability,
    RepairEpisode,
    RepairIntensity,
} from "~interfaces/repair";

export interface RepairEpisodeRow {
    id: string;
    couple_id: string;
    initiator_id: string;
    intensity: RepairIntensity;
    note: string | null;
    availability: RepairAvailability;
    acknowledged_at: string | null;
    initiator_resolved_at: string | null;
    partner_resolved_at: string | null;
    closed_at: string | null;
    created_at: string;
}

export const REPAIR_EPISODE_COLUMNS =
    "id, couple_id, initiator_id, intensity, note, availability, " +
    "acknowledged_at, initiator_resolved_at, partner_resolved_at, " +
    "closed_at, created_at";

export function mapRepairEpisodeRow(row: RepairEpisodeRow): RepairEpisode {
    return {
        id: row.id,
        coupleId: row.couple_id,
        initiatorId: row.initiator_id,
        intensity: row.intensity,
        note: row.note,
        availability: row.availability,
        acknowledgedAt: row.acknowledged_at,
        initiatorResolvedAt: row.initiator_resolved_at,
        partnerResolvedAt: row.partner_resolved_at,
        closedAt: row.closed_at,
        createdAt: row.created_at,
    };
}

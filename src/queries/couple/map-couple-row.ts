import type { Couple } from "~interfaces/couple";

export interface CoupleRow {
    id: string;
    created_at: string;
    relationship_start_date: string | null;
    acquaintance_date: string | null;
}

export const COUPLE_COLUMNS =
    "id, created_at, relationship_start_date, acquaintance_date";

export function mapCoupleRow(row: CoupleRow): Couple {
    return {
        id: row.id,
        createdAt: row.created_at,
        relationshipStartDate: row.relationship_start_date,
        acquaintanceDate: row.acquaintance_date,
    };
}

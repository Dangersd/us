import type { SupabaseClient } from "@supabase/supabase-js";

import "server-only";

import type { EventCategory } from "~interfaces/calendar";

// Идемпотентный seeder. Читает current_couple_anchor_dates view
// (RLS-scope'нут на текущую couple через current_couple_id() внутри view),
// затем upsert'ит calendar_events с уникальным ключом
// (couple_id, source, category, recurrence_anchor_date) — partial unique
// index в calendar_events_anchor_unique_idx (см. миграцию 20260522000000).
//
// Используется из:
// 1) Route Handler `/api/calendar/seed-recurring` (POST)
// 2) Server Component CalendarPage (fire-and-forget на каждый visit — fallback
//    пока Profile-мутации не wire'ятся напрямую; TENSION-3)
//
// Аргумент supabase ожидает getServerSupabase() (RLS-scoped). Это важно:
// view current_couple_anchor_dates выдаёт строки только для caller-couple.

interface AnchorRow {
    label: string;
    anchor_date: string;
    category: EventCategory;
    owner_user_id: string;
}

export async function seedRecurringForCurrentCouple(
    supabase: SupabaseClient,
): Promise<{ created: number; skipped: number }> {
    const { data: anchors, error: anchorErr } = await supabase
        .from("current_couple_anchor_dates")
        .select("label, anchor_date, category, owner_user_id")
        .returns<AnchorRow[]>();
    if (anchorErr) throw anchorErr;
    if (!anchors || anchors.length === 0) return { created: 0, skipped: 0 };

    let created = 0;
    let skipped = 0;

    for (const anchor of anchors) {
        const title =
            anchor.category === "anniversary" ? "годовщина" : "день рождения";
        const source =
            anchor.category === "anniversary" ? "anniversary" : "birthday";

        const { error } = await supabase.from("calendar_events").insert({
            title,
            date: anchor.anchor_date,
            category: anchor.category,
            state: "planned",
            source,
            is_recurring: true,
            recurrence_rule: "YEARLY",
            recurrence_anchor_date: anchor.anchor_date,
            created_by: anchor.owner_user_id,
        });

        if (error) {
            // 23505 = unique_violation → уже есть, пропускаем.
            if (error.code === "23505") {
                skipped += 1;
                continue;
            }
            // RLS/policy ошибки на created_by != auth.uid() допустимы для
            // birthday партнёра — другой партнёр не может вставить от его
            // имени. Мягко skip (партнёр сам вызовет seed на своём визите).
            if (error.code === "42501" || error.message.includes("violates")) {
                skipped += 1;
                continue;
            }
            throw error;
        }
        created += 1;
    }

    return { created, skipped };
}

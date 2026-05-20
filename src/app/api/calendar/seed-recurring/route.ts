import { NextResponse } from "next/server";

import { seedRecurringForCurrentCouple } from "~libs/calendar/seed-recurring";
import { getServerSupabase } from "~libs/supabase/server";

// POST /api/calendar/seed-recurring — идемпотентно создаёт recurring
// события (годовщина, дни рождения) для пары вызывающего пользователя
// на основании current_couple_anchor_dates view.
//
// Wire-up (TENSION-3): вызывается из Profile-мутации `onSuccess` когда
// пользователь обновляет birthday или relationship_start_date. CalendarPage
// также делает fire-and-forget вызов как fallback.
export async function POST(): Promise<NextResponse> {
    try {
        const supabase = await getServerSupabase();
        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
            return NextResponse.json(
                { error: "unauthorized" },
                { status: 401 },
            );
        }
        const result = await seedRecurringForCurrentCouple(supabase);
        return NextResponse.json(result);
    } catch (error) {
        console.error("[seed-recurring] failed", error);
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
}

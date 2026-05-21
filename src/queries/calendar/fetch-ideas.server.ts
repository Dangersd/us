import { cache } from "react";

import "server-only";

import type { EventIdea } from "~interfaces/calendar";
import { getServerSupabase } from "~libs/supabase/server";
import { calendarKeys } from "~queries/calendar/keys";
import {
    EVENT_IDEA_COLUMNS,
    type EventIdeaRow,
    mapEventIdeaRow,
} from "~queries/calendar/map-idea-row";

export const createFetchIdeasServerQuery = () => ({
    queryKey: calendarKeys.ideas(),
    queryFn: fetchIdeasServer,
});

export const fetchIdeasServer = cache(async (): Promise<EventIdea[]> => {
    const supabase = await getServerSupabase();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    const { data, error } = await supabase
        .from("event_ideas")
        .select(EVENT_IDEA_COLUMNS)
        .order("created_at", { ascending: false })
        .returns<EventIdeaRow[]>();
    if (error) throw error;
    return (data ?? []).map(mapEventIdeaRow);
});

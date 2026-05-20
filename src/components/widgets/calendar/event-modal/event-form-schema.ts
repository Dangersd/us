import * as yup from "yup";

import {
    AVAILABLE_REMINDER_OFFSETS,
    EVENT_CATEGORIES,
    MAX_EVENT_NOTE_LENGTH,
    MAX_EVENT_TITLE_LENGTH,
    MAX_LOCATION_LENGTH,
} from "~config/calendar";
import type {
    EventCategory,
    RecurrenceRule,
    ReminderOffset,
} from "~interfaces/calendar";

const CATEGORY_IDS = EVENT_CATEGORIES.map((c) => c.id) as EventCategory[];
const RECURRENCE_RULES: RecurrenceRule[] = ["YEARLY", "MONTHLY"];
const REMINDER_IDS = AVAILABLE_REMINDER_OFFSETS.map(
    (r) => r.id,
) as ReminderOffset[];

// Form stores дату как ДД-ММ-ГГГГ (display). ISO YYYY-MM-DD получаем
// конвертацией в EventForm.handleSubmit перед мутацией.
const DATE_RE = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export interface EventFormValues {
    title: string;
    date: string;
    time: string; // "" or HH:MM
    durationMinutes: number | null;
    location: string;
    category: EventCategory;
    note: string;
    isRecurring: boolean;
    recurrenceRule: RecurrenceRule | "";
    reminderOffsets: ReminderOffset[];
}

export const eventFormSchema: yup.ObjectSchema<EventFormValues> = yup
    .object({
        title: yup
            .string()
            .trim()
            .required("название обязательно")
            .max(
                MAX_EVENT_TITLE_LENGTH,
                `до ${MAX_EVENT_TITLE_LENGTH} символов`,
            ),
        date: yup
            .string()
            .required("дата обязательна")
            .matches(DATE_RE, "формат ДД-ММ-ГГГГ"),
        time: yup
            .string()
            .test("time-format", "формат HH:MM", (v) =>
                !v || v === "" ? true : TIME_RE.test(v),
            )
            .defined(),
        durationMinutes: yup
            .number()
            .nullable()
            .min(5, "минимум 5 минут")
            .max(1440, "максимум 24 часа")
            .defined(),
        location: yup
            .string()
            .max(MAX_LOCATION_LENGTH, `до ${MAX_LOCATION_LENGTH} символов`)
            .defined(),
        category: yup.mixed<EventCategory>().oneOf(CATEGORY_IDS).required(),
        note: yup
            .string()
            .max(MAX_EVENT_NOTE_LENGTH, `до ${MAX_EVENT_NOTE_LENGTH} символов`)
            .defined(),
        isRecurring: yup.boolean().required(),
        recurrenceRule: yup
            .mixed<RecurrenceRule | "">()
            .oneOf([...RECURRENCE_RULES, ""] as const)
            .defined(),
        reminderOffsets: yup
            .array()
            .of(yup.mixed<ReminderOffset>().oneOf(REMINDER_IDS).required())
            .required()
            .defined(),
    })
    .required();

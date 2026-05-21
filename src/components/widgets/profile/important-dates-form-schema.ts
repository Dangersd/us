import * as yup from "yup";

import { displayDateToIso, isoToDisplayDate } from "~libs/form/masks";

// Все 4 даты в форме — display формат ДД-ММ-ГГГГ (тот же что в event-modal,
// см. .claude/rules/modals.md + libs/form/masks.ts). Пустая строка ОК — поле
// опционально. ISO YYYY-MM-DD получаем через displayDateToIso перед мутацией.

const DATE_RE = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

export interface ImportantDatesFormValues {
    acquaintanceDate: string;
    relationshipStartDate: string;
    ownBirthday: string;
}

const optionalDate = yup
    .string()
    .test("date-format", "формат ДД-ММ-ГГГГ", (v) =>
        !v || v === "" ? true : DATE_RE.test(v),
    )
    .defined();

export const importantDatesFormSchema: yup.ObjectSchema<ImportantDatesFormValues> =
    yup
        .object({
            acquaintanceDate: optionalDate,
            relationshipStartDate: optionalDate,
            ownBirthday: optionalDate,
        })
        .required();

// Bidirectional conversion helpers — shared между Form (defaults + submit) и
// FormFields (read-only partner birthday). Жили дублями в обоих файлах до 0.10.1
// review (см. specialist finding I8).
export const isoToDisplayOrEmpty = (iso: string | null): string =>
    iso ? isoToDisplayDate(iso) : "";

export const displayToIsoOrNull = (display: string): string | null => {
    if (!display || display === "") return null;
    return displayDateToIso(display);
};

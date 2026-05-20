import * as yup from "yup";

import {
    MAX_EVENT_NOTE_LENGTH,
    MAX_EVENT_TITLE_LENGTH,
} from "~config/calendar";

export interface IdeaFormValues {
    title: string;
    note: string;
}

export const ideaFormSchema: yup.ObjectSchema<IdeaFormValues> = yup
    .object({
        title: yup
            .string()
            .trim()
            .required("название обязательно")
            .max(
                MAX_EVENT_TITLE_LENGTH,
                `до ${MAX_EVENT_TITLE_LENGTH} символов`,
            ),
        note: yup
            .string()
            .max(MAX_EVENT_NOTE_LENGTH, `до ${MAX_EVENT_NOTE_LENGTH} символов`)
            .defined(),
    })
    .required();

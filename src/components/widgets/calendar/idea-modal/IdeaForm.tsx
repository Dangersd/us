"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { tv } from "tailwind-variants";

import Input from "~components/form/fields/Input";
import Button from "~components/ui/Button";
import Textarea from "~components/ui/Textarea";
import {
    type IdeaFormValues,
    ideaFormSchema,
} from "~components/widgets/calendar/idea-modal/idea-form-schema";
import type { EventIdea } from "~interfaces/calendar";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-4 p-5"),
        header: cn("flex flex-col gap-1"),
        title: cn("font-serif text-[18px] text-ink-primary"),
        hint: cn("text-[12px] text-ink-muted"),
        row: cn("flex flex-col gap-1.5"),
        label: cn("text-[11px] uppercase tracking-wide text-ink-muted"),
        err: cn("text-[12px] text-status-error"),
        footer: cn("mt-2 flex items-center justify-between gap-2"),
        actionsRight: cn("flex items-center gap-2"),
    },
});

export interface IdeaFormSubmitPayload {
    title: string;
    note: string | null;
}

interface IdeaFormProps {
    existing: EventIdea | null;
    onSubmit: (payload: IdeaFormSubmitPayload) => Promise<void> | void;
    onCancel: () => void;
    onDelete?: () => void;
    submitting?: boolean;
    onDirtyChange?: (dirty: boolean) => void;
}

const IdeaForm = ({
    existing,
    onSubmit,
    onCancel,
    onDelete,
    submitting,
    onDirtyChange,
}: IdeaFormProps) => {
    const { root, header, title, hint, row, label, err, footer, actionsRight } =
        styles();

    const defaultValues: IdeaFormValues = {
        title: existing?.title ?? "",
        note: existing?.note ?? "",
    };

    const form = useForm<IdeaFormValues>({
        resolver: yupResolver(ideaFormSchema),
        defaultValues,
    });

    const existingId = existing?.id ?? null;
    useEffect(() => {
        if (existing) form.reset(defaultValues);
    }, [existingId, existing, form, defaultValues]);

    const isDirty = form.formState.isDirty;
    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    const handleSubmit = form.handleSubmit(async (values) => {
        await onSubmit({
            title: values.title.trim(),
            note: values.note.trim() || null,
        });
    });

    return (
        <form className={root()} onSubmit={handleSubmit} noValidate>
            <div className={header()}>
                <span className={title()}>
                    {existing ? "правка идеи" : "новая идея"}
                </span>
                <span className={hint()}>без даты — позже можно назначить</span>
            </div>

            <div className={row()}>
                <label className={label()} htmlFor="idea-title">
                    название
                </label>
                <Input
                    id="idea-title"
                    placeholder="что задумали"
                    autoFocus
                    {...form.register("title")}
                />
                {form.formState.errors.title && (
                    <span className={err()}>
                        {form.formState.errors.title.message}
                    </span>
                )}
            </div>

            <div className={row()}>
                <label className={label()} htmlFor="idea-note">
                    заметка
                </label>
                <Textarea
                    id="idea-note"
                    rows={3}
                    placeholder="детали, ссылки, что вспомнится"
                    {...form.register("note")}
                />
                {form.formState.errors.note && (
                    <span className={err()}>
                        {form.formState.errors.note.message}
                    </span>
                )}
            </div>

            <div className={footer()}>
                <div>
                    {existing && onDelete && (
                        <Button
                            type="button"
                            variant="danger-soft"
                            size="sm"
                            onClick={onDelete}
                            disabled={submitting}
                        >
                            удалить
                        </Button>
                    )}
                </div>
                <div className={actionsRight()}>
                    <Button
                        type="button"
                        variant="soft"
                        size="sm"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        закрыть
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={submitting}
                    >
                        {existing ? "сохранить" : "добавить"}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default IdeaForm;

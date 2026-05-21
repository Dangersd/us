"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { tv } from "tailwind-variants";

import Button from "~components/ui/Button";
import ImportantDatesFormFields from "~components/widgets/profile/ImportantDatesFormFields";
import {
    type ImportantDatesFormValues,
    displayToIsoOrNull,
    importantDatesFormSchema,
    isoToDisplayOrEmpty,
} from "~components/widgets/profile/important-dates-form-schema";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-5"),
        footer: cn(
            "sticky bottom-0 -mx-4 -mb-3 mt-2",
            "flex items-center justify-between gap-2",
            "border-t border-border-subtle bg-bg-surface-1",
            "px-4 py-3",
        ),
    },
});

export interface ImportantDatesFormProps {
    initial: {
        acquaintanceDate: string | null;
        relationshipStartDate: string | null;
        ownBirthday: string | null;
    };
    partnerName: string | null;
    partnerBirthday: string | null;
    onSubmit: (payload: {
        acquaintanceDate: string | null;
        relationshipStartDate: string | null;
        ownBirthday: string | null;
    }) => Promise<void> | void;
    onCancel: () => void;
    submitting?: boolean;
    onDirtyChange?: (dirty: boolean) => void;
}

const ImportantDatesForm = ({
    initial,
    partnerName,
    partnerBirthday,
    onSubmit,
    onCancel,
    submitting,
    onDirtyChange,
}: ImportantDatesFormProps) => {
    const { root, footer } = styles();

    const form = useForm<ImportantDatesFormValues>({
        defaultValues: {
            acquaintanceDate: isoToDisplayOrEmpty(initial.acquaintanceDate),
            relationshipStartDate: isoToDisplayOrEmpty(
                initial.relationshipStartDate,
            ),
            ownBirthday: isoToDisplayOrEmpty(initial.ownBirthday),
        },
        resolver: yupResolver(importantDatesFormSchema),
        mode: "onBlur",
    });
    const { formState, handleSubmit, reset } = form;
    const isDirty = formState.isDirty;

    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    // Reset формы когда couple/user-данные приехали с сервера в фоне (партнёр
    // отредактировал параллельно). Если форма уже dirty — не трогаем, чтобы
    // не затереть правки юзера. Inline build чтобы deps были только iso
    // строки (без зависимостей от reset/formState/мемоизированного объекта).
    useEffect(() => {
        if (isDirty) return;
        reset({
            acquaintanceDate: isoToDisplayOrEmpty(initial.acquaintanceDate),
            relationshipStartDate: isoToDisplayOrEmpty(
                initial.relationshipStartDate,
            ),
            ownBirthday: isoToDisplayOrEmpty(initial.ownBirthday),
        });
        // isDirty намеренно вне deps: реакция только на серверное обновление
        // initial-значений, не на каждое касание формы. reset стабилен у RHF.
    }, [
        initial.acquaintanceDate,
        initial.relationshipStartDate,
        initial.ownBirthday,
    ]);

    const submit = handleSubmit(async (values) => {
        await onSubmit({
            acquaintanceDate: displayToIsoOrNull(values.acquaintanceDate),
            relationshipStartDate: displayToIsoOrNull(
                values.relationshipStartDate,
            ),
            ownBirthday: displayToIsoOrNull(values.ownBirthday),
        });
    });

    return (
        <form onSubmit={submit} className={root()}>
            <ImportantDatesFormFields
                form={form}
                partnerName={partnerName}
                partnerBirthday={partnerBirthday}
            />
            <div className={footer()}>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onCancel}
                    disabled={submitting}
                >
                    Отмена
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                    Сохранить
                </Button>
            </div>
        </form>
    );
};

export default ImportantDatesForm;

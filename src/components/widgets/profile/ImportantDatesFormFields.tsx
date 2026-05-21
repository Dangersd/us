"use client";

import { Controller, type UseFormReturn } from "react-hook-form";

import { tv } from "tailwind-variants";

import Input from "~components/form/fields/Input";
import {
    type ImportantDatesFormValues,
    isoToDisplayOrEmpty,
} from "~components/widgets/profile/important-dates-form-schema";
import { maskDate } from "~libs/form/masks";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        field: cn("flex flex-col gap-1.5"),
        rowPair: cn("grid grid-cols-2 gap-3"),
        label: cn("text-[11px] uppercase tracking-wide text-ink-muted"),
        hint: cn("text-[11px] text-ink-muted"),
        err: cn("text-[12px] text-status-error"),
    },
});

interface ImportantDatesFormFieldsProps {
    form: UseFormReturn<ImportantDatesFormValues>;
    partnerName: string | null;
    partnerBirthday: string | null;
}

const ImportantDatesFormFields = ({
    form,
    partnerName,
    partnerBirthday,
}: ImportantDatesFormFieldsProps) => {
    const { field, rowPair, label, hint, err } = styles();
    const {
        control,
        formState: { errors },
    } = form;

    return (
        <>
            <div className={field()}>
                <label className={label()} htmlFor="dates-acquainted">
                    Дата знакомства
                </label>
                <Controller
                    control={control}
                    name="acquaintanceDate"
                    render={({ field: f }) => (
                        <Input
                            id="dates-acquainted"
                            placeholder="ДД-ММ-ГГГГ"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={10}
                            value={f.value ?? ""}
                            onBlur={f.onBlur}
                            onChange={(e) =>
                                f.onChange(maskDate(e.target.value))
                            }
                        />
                    )}
                />
                {errors.acquaintanceDate && (
                    <span className={err()}>
                        {errors.acquaintanceDate.message}
                    </span>
                )}
            </div>

            <div className={field()}>
                <label className={label()} htmlFor="dates-relationship">
                    Начало отношений
                </label>
                <Controller
                    control={control}
                    name="relationshipStartDate"
                    render={({ field: f }) => (
                        <Input
                            id="dates-relationship"
                            placeholder="ДД-ММ-ГГГГ"
                            inputMode="numeric"
                            autoComplete="off"
                            maxLength={10}
                            value={f.value ?? ""}
                            onBlur={f.onBlur}
                            onChange={(e) =>
                                f.onChange(maskDate(e.target.value))
                            }
                        />
                    )}
                />
                {errors.relationshipStartDate && (
                    <span className={err()}>
                        {errors.relationshipStartDate.message}
                    </span>
                )}
                <span className={hint()}>
                    Появится в Календаре как годовщина каждый год.
                </span>
            </div>

            <div className={rowPair()}>
                <div className={field()}>
                    <label className={label()} htmlFor="dates-own-bday">
                        Мой день рождения
                    </label>
                    <Controller
                        control={control}
                        name="ownBirthday"
                        render={({ field: f }) => (
                            <Input
                                id="dates-own-bday"
                                placeholder="ДД-ММ-ГГГГ"
                                inputMode="numeric"
                                autoComplete="off"
                                maxLength={10}
                                value={f.value ?? ""}
                                onBlur={f.onBlur}
                                onChange={(e) =>
                                    f.onChange(maskDate(e.target.value))
                                }
                            />
                        )}
                    />
                    {errors.ownBirthday && (
                        <span className={err()}>
                            {errors.ownBirthday.message}
                        </span>
                    )}
                </div>
                <div className={field()}>
                    <label className={label()} htmlFor="dates-partner-bday">
                        День рождения партнёра
                    </label>
                    <Input
                        id="dates-partner-bday"
                        placeholder="ДД-ММ-ГГГГ"
                        autoComplete="off"
                        value={isoToDisplayOrEmpty(partnerBirthday)}
                        readOnly
                        disabled
                    />
                    <span className={hint()}>
                        {partnerName
                            ? `${partnerName} может изменить в своём профиле`
                            : "партнёр может изменить в своём профиле"}
                    </span>
                </div>
            </div>
        </>
    );
};

export default ImportantDatesFormFields;

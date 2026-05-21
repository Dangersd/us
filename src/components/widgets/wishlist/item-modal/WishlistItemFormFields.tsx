"use client";

import { useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

import { tv } from "tailwind-variants";

import Input from "~components/form/fields/Input";
import Textarea from "~components/form/fields/Textarea";
import WishlistImagePreview from "~components/widgets/wishlist/WishlistImagePreview";
import type { WishlistFormValues } from "~components/widgets/wishlist/item-modal/schema";
import {
    WISHLIST_CATEGORIES,
    WISHLIST_PRIORITY_LABELS,
} from "~config/wishlist";
import type {
    WishlistCategory,
    WishlistList,
    WishlistPriority,
} from "~interfaces/wishlist";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        row: cn("flex flex-col gap-1.5"),
        label: cn("text-sm text-ink-secondary"),
        error: cn("text-sm text-status-error"),
        segmented: cn(
            "inline-flex items-center gap-1 rounded-full",
            "bg-bg-surface-1 border border-border-subtle p-0.5",
        ),
        segBtn: cn(
            "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm",
            "transition-[background,color] duration-200",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-2",
            "focus-visible:outline-glow-soft",
            "min-h-9",
        ),
        detailsToggle: cn(
            "flex items-center justify-between w-full",
            "py-2 text-sm text-ink-secondary",
        ),
        categoryGrid: cn("flex flex-wrap gap-1.5"),
    },
});

const segBtnActive = cn("bg-bg-surface-2 text-ink-primary");
const segBtnInactive = cn("bg-transparent text-ink-secondary");

const LIST_OPTIONS: ReadonlyArray<{ id: WishlistList; label: string }> = [
    { id: "want", label: "Хочу" },
    { id: "love", label: "Люблю" },
    { id: "shared", label: "Наше" },
];

const PRIORITY_OPTIONS: ReadonlyArray<{ id: WishlistPriority; label: string }> =
    [
        { id: "someday", label: WISHLIST_PRIORITY_LABELS.someday },
        { id: "want", label: WISHLIST_PRIORITY_LABELS.want },
        { id: "really_want", label: WISHLIST_PRIORITY_LABELS.really_want },
    ];

export interface WishlistItemFormFieldsProps {
    form: UseFormReturn<WishlistFormValues>;
    isEdit: boolean;
}

const WishlistItemFormFields = ({
    form,
    isEdit,
}: WishlistItemFormFieldsProps) => {
    const {
        row,
        label,
        error,
        segmented,
        segBtn,
        detailsToggle,
        categoryGrid,
    } = styles();
    const [detailsOpen, setDetailsOpen] = useState(isEdit);
    const watchedImage = form.watch("imageUrl");
    const watchedCategory = form.watch("category");
    const errors = form.formState.errors;

    return (
        <div className="flex flex-col gap-4">
            {/* Essentials */}
            <div className={row()}>
                <label htmlFor="wl-title" className={label()}>
                    Название
                </label>
                <Input
                    id="wl-title"
                    size="lg"
                    {...form.register("title")}
                    placeholder="Что хочется"
                    aria-invalid={Boolean(errors.title)}
                />
                {errors.title?.message ? (
                    <span className={error()}>{errors.title.message}</span>
                ) : null}
            </div>

            {!isEdit && (
                <div className={row()}>
                    <span className={label()}>Список</span>
                    <Controller
                        control={form.control}
                        name="list"
                        render={({ field }) => (
                            <div className={segmented()} role="radiogroup">
                                {LIST_OPTIONS.map((opt) => {
                                    const active = field.value === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            onClick={() =>
                                                field.onChange(opt.id)
                                            }
                                            className={cn(
                                                segBtn(),
                                                active
                                                    ? segBtnActive
                                                    : segBtnInactive,
                                            )}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    />
                </div>
            )}

            <div className={row()}>
                <label htmlFor="wl-image" className={label()}>
                    Картинка (URL)
                </label>
                <Input
                    id="wl-image"
                    {...form.register("imageUrl")}
                    placeholder="https://…"
                    aria-invalid={Boolean(errors.imageUrl)}
                />
                {errors.imageUrl?.message ? (
                    <span className={error()}>{errors.imageUrl.message}</span>
                ) : null}
                {watchedImage ? (
                    <div className="mt-1 w-32">
                        <WishlistImagePreview
                            url={watchedImage}
                            title={form.getValues("title") || "превью"}
                            category={watchedCategory}
                        />
                    </div>
                ) : null}
            </div>

            {/* Детали — collapsible */}
            <button
                type="button"
                onClick={() => setDetailsOpen((v) => !v)}
                className={detailsToggle()}
                aria-expanded={detailsOpen}
            >
                <span>Детали</span>
                <span aria-hidden>{detailsOpen ? "−" : "+"}</span>
            </button>

            {detailsOpen ? (
                <div className="flex flex-col gap-4">
                    <div className={row()}>
                        <span className={label()}>Категория</span>
                        <Controller
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <div className={categoryGrid()}>
                                    {WISHLIST_CATEGORIES.map((cat) => {
                                        const active = field.value === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() =>
                                                    field.onChange(
                                                        cat.id as WishlistCategory,
                                                    )
                                                }
                                                className={cn(
                                                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
                                                    "min-h-9 transition-[background,color,border-color]",
                                                    active
                                                        ? "bg-bg-surface-1 border-border-warm text-ink-primary"
                                                        : "bg-transparent border-border-subtle text-ink-secondary",
                                                )}
                                            >
                                                <span
                                                    aria-hidden
                                                    className="inline-block size-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            cat.dot,
                                                    }}
                                                />
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />
                    </div>

                    <div className={row()}>
                        <span className={label()}>Приоритет</span>
                        <Controller
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <div className={segmented()} role="radiogroup">
                                    {PRIORITY_OPTIONS.map((opt) => {
                                        const active = field.value === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                role="radio"
                                                aria-checked={active}
                                                onClick={() =>
                                                    field.onChange(opt.id)
                                                }
                                                className={cn(
                                                    segBtn(),
                                                    active
                                                        ? segBtnActive
                                                        : segBtnInactive,
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />
                    </div>

                    <div className={row()}>
                        <label htmlFor="wl-price" className={label()}>
                            Цена (примерно)
                        </label>
                        <Input
                            id="wl-price"
                            {...form.register("priceEstimate")}
                            placeholder="~12 000 ₽"
                        />
                    </div>

                    <div className={row()}>
                        <label htmlFor="wl-link" className={label()}>
                            Ссылка
                        </label>
                        <Input
                            id="wl-link"
                            {...form.register("linkUrl")}
                            placeholder="https://…"
                            aria-invalid={Boolean(errors.linkUrl)}
                        />
                        {errors.linkUrl?.message ? (
                            <span className={error()}>
                                {errors.linkUrl.message}
                            </span>
                        ) : null}
                    </div>

                    <div className={row()}>
                        <label htmlFor="wl-note" className={label()}>
                            Заметка
                        </label>
                        <Textarea
                            id="wl-note"
                            {...form.register("note")}
                            placeholder="Заметка"
                            rows={3}
                        />
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default WishlistItemFormFields;

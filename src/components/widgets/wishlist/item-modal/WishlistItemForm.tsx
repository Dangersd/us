"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { tv } from "tailwind-variants";

import Button from "~components/ui/Button";
import WishlistItemFormFields from "~components/widgets/wishlist/item-modal/WishlistItemFormFields";
import {
    type WishlistFormValues,
    wishlistItemSchema,
} from "~components/widgets/wishlist/item-modal/schema";
import type { WishlistItem, WishlistList } from "~interfaces/wishlist";
import { cn } from "~libs/utils";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-4"),
        footer: cn(
            "sticky bottom-0 -mx-4 -mb-3 mt-2",
            "flex items-center justify-between gap-2",
            "border-t border-border-subtle bg-bg-surface-1",
            "px-4 py-3",
        ),
    },
});

export interface WishlistItemSubmitPayload {
    title: string;
    list: WishlistList;
    imageUrl: string | null;
    category: WishlistFormValues["category"];
    priority: WishlistFormValues["priority"];
    priceEstimate: string | null;
    linkUrl: string | null;
    note: string | null;
}

export interface WishlistItemFormProps {
    existing: WishlistItem | null;
    initialList: WishlistList | null;
    onSubmit: (payload: WishlistItemSubmitPayload) => Promise<void> | void;
    onCancel: () => void;
    onDelete?: () => void;
    submitting?: boolean;
    onDirtyChange?: (dirty: boolean) => void;
}

const emptyToNull = (v: string): string | null => {
    const t = v.trim();
    return t.length === 0 ? null : t;
};

const WishlistItemForm = ({
    existing,
    initialList,
    onSubmit,
    onCancel,
    onDelete,
    submitting,
    onDirtyChange,
}: WishlistItemFormProps) => {
    const { root, footer } = styles();

    const defaultValues: WishlistFormValues = {
        title: existing?.title ?? "",
        list: existing?.list ?? initialList ?? "want",
        imageUrl: existing?.imageUrl ?? "",
        category: existing?.category ?? "other",
        priority: existing?.priority ?? "want",
        priceEstimate: existing?.priceEstimate ?? "",
        linkUrl: existing?.linkUrl ?? "",
        note: existing?.note ?? "",
    };

    const form = useForm<WishlistFormValues>({
        resolver: yupResolver(wishlistItemSchema),
        defaultValues,
    });

    // Re-seed когда existing подгружается асинхронно (useItem loading).
    // Ключ — id; смотрим именно на смену id, не на каждое обновление объекта.
    const existingId = existing?.id ?? null;
    useEffect(() => {
        if (existing) form.reset(defaultValues);
    }, [existingId, existing, form, defaultValues]);

    const isDirty = form.formState.isDirty;
    useEffect(() => {
        onDirtyChange?.(isDirty);
    }, [isDirty, onDirtyChange]);

    const handleSubmit = form.handleSubmit(async (values) => {
        const payload: WishlistItemSubmitPayload = {
            title: values.title.trim(),
            list: values.list,
            imageUrl: emptyToNull(values.imageUrl),
            category: values.category,
            priority: values.priority,
            priceEstimate: emptyToNull(values.priceEstimate),
            linkUrl: emptyToNull(values.linkUrl),
            note: emptyToNull(values.note),
        };
        await onSubmit(payload);
    });

    const isEdit = existing !== null;

    return (
        <form className={root()} onSubmit={handleSubmit} noValidate>
            <WishlistItemFormFields form={form} isEdit={isEdit} />
            <div className={footer()}>
                <div className="flex items-center gap-2">
                    {isEdit && onDelete ? (
                        <Button
                            type="button"
                            variant="danger-soft"
                            size="sm"
                            onClick={onDelete}
                            disabled={submitting}
                        >
                            удалить
                        </Button>
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="soft"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        закрыть
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={submitting}
                    >
                        {isEdit ? "сохранить" : "добавить"}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default WishlistItemForm;

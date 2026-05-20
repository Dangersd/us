"use client";

import { useEffect, useState } from "react";

import Input from "~components/form/fields/Input";
import { cn } from "~libs/utils";

export interface WishlistSearchInputProps {
    value: string;
    onChange: (next: string) => void;
}

// Локальный draft → debounce 250ms → onChange. Чтобы не пере-фильтровать
// весь список на каждый ввод. Source of truth остаётся снаружи (родитель
// держит `value`), но input не пере-рендеривает поле при каждом обновлении
// родительского value — uncontrolled-стиль с initial из props.
const WishlistSearchInput = ({ value, onChange }: WishlistSearchInputProps) => {
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        if (draft === value) return;
        const t = setTimeout(() => onChange(draft), 250);
        return () => clearTimeout(t);
    }, [draft, value, onChange]);

    return (
        <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Поиск по названию или заметке"
            aria-label="Поиск"
            className={cn("h-11")}
        />
    );
};

export default WishlistSearchInput;

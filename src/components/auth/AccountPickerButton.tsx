"use client";

import Button from "~components/ui/Button";
import type { Gender } from "~interfaces/user";
import { cn } from "~libs/utils";

interface AccountPickerButtonProps {
    gender: Gender;
    label: string;
    state: "idle" | "selected" | "dimmed";
    disabled?: boolean;
    onClick: () => void;
}

const AccountPickerButton = ({
    gender,
    label,
    state,
    disabled,
    onClick,
}: AccountPickerButtonProps) => (
    <Button
        size="pill"
        variant="soft"
        disabled={disabled}
        onClick={onClick}
        className={cn(
            "font-display h-14 w-30 text-xl",
            "transition-[background-color,opacity,box-shadow] duration-300",
            {
                "bg-hue-him/20 shadow-glow":
                    state === "selected" && gender === "male",
                "bg-hue-her/20 shadow-glow":
                    state === "selected" && gender === "female",
                "opacity-30": state === "dimmed",
            },
        )}
    >
        {label}
    </Button>
);

export default AccountPickerButton;

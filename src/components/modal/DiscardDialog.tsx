"use client";

import { tv } from "tailwind-variants";

import Modal from "~components/modal/Modal";
import Button from "~components/ui/Button";
import { cn } from "~libs/utils";

interface DiscardDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

const styles = tv({
    slots: {
        body: cn("flex flex-col gap-3 p-5"),
        title: cn("font-serif text-[18px] text-ink-primary"),
        text: cn("text-sm text-ink-secondary"),
        actions: cn("mt-2 flex items-center justify-end gap-2"),
    },
});

// Confirm-перед-закрытием. Используется FormAwareModal когда form isDirty.
// isDismissable=false, чтобы случайный backdrop click не пропустил дальше.
const DiscardDialog = ({
    open,
    onConfirm,
    onCancel,
    title = "Закрыть без сохранения?",
    message = "Изменения не будут сохранены.",
    confirmLabel = "закрыть",
    cancelLabel = "остаться",
}: DiscardDialogProps) => {
    const { body, title: titleCls, text, actions } = styles();
    return (
        <Modal
            open={open}
            onClose={onCancel}
            size="sm"
            ariaLabel={title}
            isDismissable={false}
        >
            <div className={body()}>
                <span className={titleCls()}>{title}</span>
                <p className={text()}>{message}</p>
                <div className={actions()}>
                    <Button
                        type="button"
                        variant="soft"
                        size="sm"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant="danger-soft"
                        size="sm"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DiscardDialog;

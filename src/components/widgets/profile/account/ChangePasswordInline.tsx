"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import { tv } from "tailwind-variants";

import Input from "~components/form/fields/Input";
import Button from "~components/ui/Button";
import {
    type ChangePasswordFormValues,
    changePasswordFormSchema,
} from "~components/widgets/profile/account/change-password-form-schema";
import { cn } from "~libs/utils";
import { useChangePassword } from "~queries/user/use-change-password";

const styles = tv({
    slots: {
        root: cn("flex flex-col gap-3"),
        form: cn("flex flex-col gap-3"),
        field: cn("flex flex-col gap-1"),
        label: cn("text-xs text-ink-muted px-1"),
        error: cn("text-xs text-status-error px-1"),
        footer: cn("flex items-center justify-between gap-2 pt-1"),
        success: cn("text-sm text-status-success px-1 italic"),
    },
});

const ChangePasswordInline = () => {
    const { root, form, field, label, error, footer, success } = styles();
    const [open, setOpen] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const changePassword = useChangePassword();

    // Success-сообщение «Пароль обновлён» гасится через 4с. Эффект-driven
    // вместо ref-based setTimeout — cleanup автоматически срабатывает на
    // unmount или на повторный setJustSaved(true) (когда юзер сразу же
    // меняет пароль повторно).
    useEffect(() => {
        if (!justSaved) return;
        const timer = setTimeout(() => setJustSaved(false), 4000);
        return () => clearTimeout(timer);
    }, [justSaved]);

    const formApi = useForm<ChangePasswordFormValues>({
        defaultValues: { newPassword: "", confirmPassword: "" },
        resolver: yupResolver(changePasswordFormSchema),
        mode: "onBlur",
    });
    const { control, handleSubmit, reset, formState, setError } = formApi;

    const onSubmit = handleSubmit(async (values) => {
        try {
            await changePassword.mutateAsync({
                newPassword: values.newPassword,
            });
            reset({ newPassword: "", confirmPassword: "" });
            setOpen(false);
            setJustSaved(true);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Не удалось обновить";
            setError("newPassword", { message: msg });
        }
    });

    const onCancel = () => {
        reset({ newPassword: "", confirmPassword: "" });
        setOpen(false);
    };

    if (!open) {
        return (
            <div className={root()}>
                <Button
                    type="button"
                    variant="soft"
                    size="md"
                    onClick={() => setOpen(true)}
                >
                    Сменить пароль
                </Button>
                {justSaved ? (
                    <span className={success()}>Пароль обновлён</span>
                ) : null}
            </div>
        );
    }

    const submitting = formState.isSubmitting || changePassword.isPending;

    return (
        <div className={root()}>
            <form onSubmit={onSubmit} className={form()} noValidate>
                <div className={field()}>
                    <label className={label()} htmlFor="change-password-new">
                        Новый пароль
                    </label>
                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field: f }) => (
                            <Input
                                {...f}
                                id="change-password-new"
                                type="password"
                                autoComplete="new-password"
                                disabled={submitting}
                            />
                        )}
                    />
                    {formState.errors.newPassword ? (
                        <span className={error()}>
                            {formState.errors.newPassword.message}
                        </span>
                    ) : null}
                </div>
                <div className={field()}>
                    <label
                        className={label()}
                        htmlFor="change-password-confirm"
                    >
                        Подтверждение
                    </label>
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field: f }) => (
                            <Input
                                {...f}
                                id="change-password-confirm"
                                type="password"
                                autoComplete="new-password"
                                disabled={submitting}
                            />
                        )}
                    />
                    {formState.errors.confirmPassword ? (
                        <span className={error()}>
                            {formState.errors.confirmPassword.message}
                        </span>
                    ) : null}
                </div>
                <div className={footer()}>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={submitting}
                    >
                        {submitting ? "Сохраняем..." : "Сохранить"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordInline;

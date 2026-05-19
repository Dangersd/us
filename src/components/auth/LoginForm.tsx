"use client";

import { type FormEvent, useReducer } from "react";

import { AnimatePresence, motion } from "framer-motion";

import AccountPickerButton from "~components/auth/AccountPickerButton";
import LoginShell from "~components/auth/LoginShell";
import {
    initialLoginState,
    loginReducer,
} from "~components/auth/use-login-state";
import Input from "~components/form/fields/Input";
import Button from "~components/ui/Button";
import LogoUs from "~components/ui/LogoUs";
import type { Gender } from "~interfaces/user";
import { cn } from "~libs/utils";
import { ACCOUNT_EMAILS, SignInError, useSignIn } from "~queries/user";

const ERROR_TEXT = {
    invalid_credentials: "Пароль не подошёл. Попробуй ещё раз.",
    generic: "Не получилось войти. Проверь интернет.",
} as const;

const EASE = [0.22, 1, 0.36, 1] as const;

const LoginForm = () => {
    const [state, dispatch] = useReducer(loginReducer, initialLoginState);
    const signIn = useSignIn();

    const currentGender: Gender | undefined =
        state.kind === "idle" ? undefined : state.gender;
    const isSelected = state.kind !== "idle";
    const isSubmitting = state.kind === "submitting";
    const password = state.kind === "idle" ? "" : state.password;
    const error = state.kind === "selected" ? state.error : undefined;

    const pickerStateFor = (gender: Gender) => {
        if (!isSelected) return "idle";
        return currentGender === gender ? "selected" : "dimmed";
    };

    const handlePick = (gender: Gender) => {
        if (currentGender === gender) return;
        dispatch({ type: "pick", gender });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (state.kind !== "selected" || state.password.length === 0) return;
        const { gender, password: pwd } = state;
        dispatch({ type: "submit" });
        signIn.mutate(
            { gender, password: pwd },
            {
                onError: (err) => {
                    const kind =
                        err instanceof SignInError ? err.kind : "generic";
                    dispatch({ type: "error", kind });
                },
            },
        );
    };

    return (
        <LoginShell hue={currentGender}>
            <LogoUs className="mb-12" />

            <AnimatePresence mode="wait">
                {!isSelected && (
                    <motion.p
                        key="subtitle"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "font-display text-ink-secondary mb-8 text-xl",
                        )}
                    >
                        Кто пришёл сегодня?
                    </motion.p>
                )}
            </AnimatePresence>

            <div className={cn("flex flex-row gap-4")}>
                <AccountPickerButton
                    gender="male"
                    label="Я"
                    state={pickerStateFor("male")}
                    disabled={isSubmitting}
                    onClick={() => handlePick("male")}
                />
                <AccountPickerButton
                    gender="female"
                    label="Она"
                    state={pickerStateFor("female")}
                    disabled={isSubmitting}
                    onClick={() => handlePick("female")}
                />
            </div>

            <AnimatePresence>
                {isSelected && (
                    <motion.form
                        key="password-panel"
                        initial={{ opacity: 0, y: -12, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -12, height: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        onSubmit={handleSubmit}
                        className={cn(
                            "mt-8 flex w-full flex-col items-center gap-4 overflow-hidden",
                        )}
                    >
                        {/* Скрытый email для password manager autofill. */}
                        <input
                            type="email"
                            name="email"
                            autoComplete="username"
                            readOnly
                            value={
                                currentGender
                                    ? ACCOUNT_EMAILS[currentGender]
                                    : ""
                            }
                            hidden
                            tabIndex={-1}
                        />

                        <Input
                            size="lg"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            autoFocus
                            placeholder="Пароль"
                            value={password}
                            readOnly={isSubmitting}
                            onChange={(e) =>
                                dispatch({
                                    type: "input",
                                    password: e.target.value,
                                })
                            }
                        />

                        {error && (
                            <p
                                role="alert"
                                className={cn("text-status-error text-sm")}
                            >
                                {ERROR_TEXT[error]}
                            </p>
                        )}

                        <Button
                            type="submit"
                            size="xl"
                            className="w-full"
                            disabled={isSubmitting || password.length === 0}
                        >
                            {isSubmitting ? "Заходим..." : "Войти"}
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isSubmitting}
                            onClick={() => dispatch({ type: "reset" })}
                            className="mt-2"
                        >
                            ← выбрать другого
                        </Button>
                    </motion.form>
                )}
            </AnimatePresence>
        </LoginShell>
    );
};

export default LoginForm;

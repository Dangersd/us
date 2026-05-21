import * as yup from "yup";

export const MIN_PASSWORD_LENGTH = 8;

export interface ChangePasswordFormValues {
    newPassword: string;
    confirmPassword: string;
}

export const changePasswordFormSchema: yup.ObjectSchema<ChangePasswordFormValues> =
    yup.object({
        newPassword: yup
            .string()
            .required("Введи новый пароль")
            .min(
                MIN_PASSWORD_LENGTH,
                `Минимум ${MIN_PASSWORD_LENGTH} символов`,
            ),
        confirmPassword: yup
            .string()
            .required("Повтори пароль")
            .oneOf([yup.ref("newPassword")], "Пароли не совпадают"),
    });

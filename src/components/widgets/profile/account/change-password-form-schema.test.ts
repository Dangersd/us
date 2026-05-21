import { describe, expect, it } from "vitest";

import { changePasswordFormSchema } from "~components/widgets/profile/account/change-password-form-schema";

describe("changePasswordFormSchema", () => {
    it("accepts a valid matching pair", async () => {
        await expect(
            changePasswordFormSchema.validate({
                newPassword: "longenough123",
                confirmPassword: "longenough123",
            }),
        ).resolves.toBeTruthy();
    });

    it("rejects password shorter than 8", async () => {
        await expect(
            changePasswordFormSchema.validate({
                newPassword: "short",
                confirmPassword: "short",
            }),
        ).rejects.toThrow(/Минимум 8/);
    });

    it("rejects mismatched confirmation", async () => {
        await expect(
            changePasswordFormSchema.validate({
                newPassword: "longenough123",
                confirmPassword: "differentpw99",
            }),
        ).rejects.toThrow(/не совпадают/);
    });

    it("rejects empty input (newPassword + confirmPassword)", async () => {
        await expect(
            changePasswordFormSchema.validate({
                newPassword: "",
                confirmPassword: "",
            }),
        ).rejects.toBeInstanceOf(Error);
    });

    it("rejects when confirm is missing but new is valid", async () => {
        await expect(
            changePasswordFormSchema.validate({
                newPassword: "longenough123",
                confirmPassword: "",
            }),
        ).rejects.toBeInstanceOf(Error);
    });

    it("accepts exactly 8 characters", async () => {
        await expect(
            changePasswordFormSchema.validate({
                newPassword: "abcdefgh",
                confirmPassword: "abcdefgh",
            }),
        ).resolves.toBeTruthy();
    });
});

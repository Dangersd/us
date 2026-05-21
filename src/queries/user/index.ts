// Browser-safe экспорты query-слоя user.
// fetchCurrentUserServer и createFetchCurrentUserServerQuery импортируются
// явно из ~queries/user/fetch-current-user.server чтобы случайно не утащить
// next/headers в client bundle.
export { ACCOUNT_EMAILS } from "~queries/user/account-emails";
export {
    createFetchCurrentUserQuery,
    fetchCurrentUser,
} from "~queries/user/fetch-current-user";
export { userKeys } from "~queries/user/keys";
export {
    USER_COLUMNS,
    mapUserRow,
    type UserRow,
} from "~queries/user/map-user-row";
export { useCurrentUser } from "~queries/user/use-current-user";
export {
    SignInError,
    type SignInErrorKind,
    useSignIn,
} from "~queries/user/use-sign-in";
export { useSignOut } from "~queries/user/use-sign-out";
export {
    type UpdateUserBirthdayInput,
    useUpdateUserBirthday,
} from "~queries/user/use-update-user-birthday";

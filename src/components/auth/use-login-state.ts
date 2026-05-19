import type { Gender } from "~interfaces/user";
import type { SignInErrorKind } from "~queries/user";

export type LoginState =
    | { kind: "idle" }
    | {
          kind: "selected";
          gender: Gender;
          password: string;
          error?: SignInErrorKind;
      }
    | { kind: "submitting"; gender: Gender; password: string };

export type LoginAction =
    | { type: "pick"; gender: Gender }
    | { type: "reset" }
    | { type: "input"; password: string }
    | { type: "submit" }
    | { type: "error"; kind: SignInErrorKind };

export const initialLoginState: LoginState = { kind: "idle" };

export function loginReducer(
    state: LoginState,
    action: LoginAction,
): LoginState {
    switch (action.type) {
        case "pick":
            if (state.kind === "submitting") return state;
            return { kind: "selected", gender: action.gender, password: "" };
        case "reset":
            if (state.kind === "submitting") return state;
            return { kind: "idle" };
        case "input":
            if (state.kind === "selected") {
                return {
                    ...state,
                    password: action.password,
                    error: undefined,
                };
            }
            return state;
        case "submit":
            if (state.kind === "selected" && state.password.length > 0) {
                return {
                    kind: "submitting",
                    gender: state.gender,
                    password: state.password,
                };
            }
            return state;
        case "error":
            if (state.kind === "submitting") {
                return {
                    kind: "selected",
                    gender: state.gender,
                    password: state.password,
                    error: action.kind,
                };
            }
            return state;
    }
}

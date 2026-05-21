import { describe, expect, it } from "vitest";

import { createFetchCurrentUserQuery } from "~queries/user/fetch-current-user";
import { createFetchCurrentUserServerQuery } from "~queries/user/fetch-current-user.server";
import { userKeys } from "~queries/user/keys";

describe("user factories — queryKey shape", () => {
    it("createFetchCurrentUserQuery", () => {
        expect(createFetchCurrentUserQuery().queryKey).toEqual(
            userKeys.current(),
        );
    });

    it("createFetchCurrentUserServerQuery", () => {
        expect(createFetchCurrentUserServerQuery().queryKey).toEqual(
            userKeys.current(),
        );
    });
});

import { describe, expect, it } from "vitest";

import { createFetchPartnerProfileQuery } from "~queries/profile/fetch-partner-profile";
import { createFetchPartnerProfileServerQuery } from "~queries/profile/fetch-partner-profile.server";
import { profileKeys } from "~queries/profile/keys";

describe("profile factories — queryKey shape", () => {
    it("createFetchPartnerProfileQuery", () => {
        expect(createFetchPartnerProfileQuery().queryKey).toEqual(
            profileKeys.partner(),
        );
    });

    it("createFetchPartnerProfileServerQuery", () => {
        expect(createFetchPartnerProfileServerQuery().queryKey).toEqual(
            profileKeys.partner(),
        );
    });
});

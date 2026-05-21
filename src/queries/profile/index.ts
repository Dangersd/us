// fetchPartnerProfileServer и createFetchPartnerProfileServerQuery импортируются
// явно из ~queries/profile/fetch-partner-profile.server (он server-only).
export {
    createFetchPartnerProfileQuery,
    fetchPartnerProfile,
} from "~queries/profile/fetch-partner-profile";
export { profileKeys } from "~queries/profile/keys";
export { usePartnerProfile } from "~queries/profile/use-partner-profile";

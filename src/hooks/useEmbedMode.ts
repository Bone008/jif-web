import { useSearchParams } from "./useSearchParams";

const EMBED_PARAM = "embed";

/** Hook to determine if the embed mode is active based on the URL parameter. */
export function useEmbedMode(): boolean {
  const search = useSearchParams();
  return search.get(EMBED_PARAM) === "1";
}

/** Returns the current URL with embed mode enabled. */
export function getUrlWithEmbedMode() {
  const url = new URL(location.href);
  url.searchParams.append(EMBED_PARAM, "1");
  return url.toString();
}

/** Returns the current URL with embed mode disabled. */
export function getUrlWithoutEmbedMode() {
  const url = new URL(location.href);
  url.searchParams.delete(EMBED_PARAM);
  return url.toString();
}

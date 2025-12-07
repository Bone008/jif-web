import { useSearchParams } from "./useSearchParams";

const EMBED_PARAM = "embed";

/** Hook to determine if the embed mode is active based on the URL parameter. */
export function useEmbedMode(): boolean {
  const search = useSearchParams();
  return search.get(EMBED_PARAM) === "1";
}

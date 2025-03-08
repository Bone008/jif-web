import { useState, useEffect } from "react";

export function useSearchParams() {
  const [params, setParams] = useState(
    new URLSearchParams(window.location.search),
  );

  useEffect(() => {
    function handlePopState() {
      setParams(new URLSearchParams(window.location.search));
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function get(key: string): string | null {
    return params.get(key);
  }

  function updateParams(newParams: URLSearchParams, replace: boolean) {
    if (replace) {
      window.history.replaceState(null, "", "?" + newParams.toString());
    } else {
      window.history.pushState(null, "", "?" + newParams.toString());
    }
    setParams(newParams);
  }

  function set(key: string, value: string, replace: boolean = false) {
    const newParams = new URLSearchParams(window.location.search);
    newParams.set(key, value);
    updateParams(newParams, replace);
  }

  function setAll(
    values: Record<string, string | null>,
    replace: boolean = false,
  ) {
    const newParams = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) {
      if (value !== null && value !== undefined) {
        newParams.set(key, value);
      }
    }
    updateParams(newParams, replace);
  }

  function delete_(key: string) {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete(key);
    updateParams(newParams, false);
  }

  return { get, set, setAll, delete: delete_ };
}

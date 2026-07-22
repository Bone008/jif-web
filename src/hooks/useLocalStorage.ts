import { Dispatch, SetStateAction, useEffect, useState } from "react";

const APP_KEY_PREFIX = "jifWeb:";

/**
 * Like `useState`, but persists the value in `localStorage` under `key`.
 * The value is (de)serialized with `JSON.parse` / `JSON.stringify`.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(toKey(key));
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(toKey(key), JSON.stringify(value));
    } catch {
      // Ignore write errors (e.g. storage disabled or full).
    }
  }, [key, value]);

  return [value, setValue];
}

function toKey(key: string): string {
  return APP_KEY_PREFIX + key;
}

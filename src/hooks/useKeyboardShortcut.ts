import { useEffect } from "react";

export interface UseKeyboardShortcutArgs {
  key: string;
  onKeyPressed: () => void;
  deps?: any[];
}

export function useKeyboardShortcut({
  key,
  onKeyPressed,
  deps,
}: UseKeyboardShortcutArgs) {
  useEffect(() => {
    function keyDownHandler(e: globalThis.KeyboardEvent) {
      // Ignore when focus is on an input element
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      // Ignore Ctrl or Meta key combinations to avoid breaking browser
      // shortcuts.
      if (e.ctrlKey || e.metaKey) {
        return;
      }
      if (e.key === key) {
        e.preventDefault();
        onKeyPressed();
      }
    }

    document.addEventListener("keydown", keyDownHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, deps ?? []);
}

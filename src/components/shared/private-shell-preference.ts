export const privateShellStorageKey = "ctrl_private_shell_mode";
const privateShellStorageEvent = "ctrl:private-shell-mode-change";

export type PrivateShellMode = "collapsed" | "expanded";

export function normalizePrivateShellMode(value: string | null | undefined): PrivateShellMode {
  return value === "collapsed" ? "collapsed" : "expanded";
}

export function getPrivateShellModeSnapshot() {
  if (typeof window === "undefined") {
    return "expanded";
  }

  return normalizePrivateShellMode(window.localStorage.getItem(privateShellStorageKey));
}

export function subscribeToPrivateShellMode(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === privateShellStorageKey) {
      onStoreChange();
    }
  };

  const handleCustomEvent = () => {
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(privateShellStorageEvent, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(privateShellStorageEvent, handleCustomEvent);
  };
}

export function setPrivateShellMode(mode: PrivateShellMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(privateShellStorageKey, mode);
  window.dispatchEvent(new Event(privateShellStorageEvent));
}

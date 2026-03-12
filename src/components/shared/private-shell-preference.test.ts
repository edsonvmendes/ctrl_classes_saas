import { describe, expect, it } from "vitest";

import {
  normalizePrivateShellMode,
  privateShellStorageKey,
} from "@/components/shared/private-shell-preference";

describe("private shell preference", () => {
  it("normalizes supported storage values", () => {
    expect(normalizePrivateShellMode("collapsed")).toBe("collapsed");
    expect(normalizePrivateShellMode("expanded")).toBe("expanded");
  });

  it("falls back to expanded for unknown values", () => {
    expect(normalizePrivateShellMode(null)).toBe("expanded");
    expect(normalizePrivateShellMode("anything-else")).toBe("expanded");
  });

  it("exposes a stable storage key", () => {
    expect(privateShellStorageKey).toBe("ctrl_private_shell_mode");
  });
});

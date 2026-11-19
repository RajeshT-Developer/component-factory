import { validateButtonConfig } from "./buttonConfig.js";
import { validateDropdownConfig } from "./dropdownConfig.js";

import {
  createDefaultScreenConfig,
  validateScreenConfig
} from "./screenConfig.js";

const STORAGE_KEY = "component-factory.workspace.v1";

function isRecord(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

export function isValidWorkspace(state) {
  try {
    if (!isRecord(state) || state.schemaVersion !== 1) {
      return false;
    }

    if (!["button", "dropdown"].includes(state.selectedComponent)) {
      return false;
    }

    if (
      state.workspaceMode !== undefined &&
      !["components", "screen"].includes(state.workspaceMode)
    ) {
      return false;
    }

    if (
      !isRecord(state.buttonConfig) ||
      !isRecord(state.dropdownConfig)
    ) {
      return false;
    }

    if (
      !validateButtonConfig(state.buttonConfig).valid ||
      !validateDropdownConfig(state.dropdownConfig).valid
    ) {
      return false;
    }

    if (
      state.screenConfig !== undefined &&
      (
        !isRecord(state.screenConfig) ||
        !validateScreenConfig(state.screenConfig).valid
      )
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function normalizeWorkspace(state) {
  return {
    schemaVersion: 1,
    workspaceMode: state.workspaceMode ?? "components",
    selectedComponent: state.selectedComponent,
    buttonConfig: state.buttonConfig,
    dropdownConfig: state.dropdownConfig,
    screenConfig:
      state.screenConfig ?? createDefaultScreenConfig()
  };
}

export function loadWorkspace() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored === null) return null;

  const state = JSON.parse(stored);

  if (!isValidWorkspace(state)) {
    throw new Error(
      "The saved workspace is invalid or uses an unsupported version."
    );
  }

  return normalizeWorkspace(state);
}

export function saveWorkspace(state) {
  if (!isValidWorkspace(state)) {
    return false;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...normalizeWorkspace(state),
      savedAt: new Date().toISOString()
    })
  );

  return true;
}
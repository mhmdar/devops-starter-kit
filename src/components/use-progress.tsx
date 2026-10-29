"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import type { ProgressItem } from "@/content/types";

const STORAGE_KEY = "drillbook-progress-v1";

function readStored(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const next: Record<string, boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value === true) next[key] = true;
    }
    return next;
  } catch {
    return {};
  }
}

function useProgress(index: ProgressItem[]) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // First paint must match the server (no checks). localStorage is applied after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only progress, read once
    setChecked(readStored());
  }, []);

  function toggle(id: string) {
    setChecked((current) => {
      const next = { ...current, [id]: !current[id] };
      if (!next[id]) delete next[id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setChecked({});
  }

  const completed = index.filter((item) => item.stepIds.every((id) => checked[id])).length;

  return { checked, toggle, reset, completed, total: index.length };
}

export function drillComplete(stepIds: string[], checked: Record<string, boolean>) {
  return stepIds.length > 0 && stepIds.every((id) => checked[id]);
}

type ProgressValue = ReturnType<typeof useProgress>;

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({
  index,
  children,
}: {
  index: ProgressItem[];
  children: ReactNode;
}) {
  const value = useProgress(index);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useLabProgress() {
  const value = useContext(ProgressContext);
  if (!value) {
    throw new Error("useLabProgress must be used inside ProgressProvider");
  }
  return value;
}

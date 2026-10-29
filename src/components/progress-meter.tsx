"use client";

import { useLabProgress } from "./use-progress";

export function ProgressMeter() {
  const { completed, total } = useLabProgress();
  const done = total > 0 && completed === total;
  return (
    <p className={`font-mono text-xs tracking-wide ${done ? "text-pine" : "text-muted-foreground"}`}>
      {completed}/{total} drills
    </p>
  );
}

"use client";

import { Button } from "@/components/ui/button";

import { useLabProgress } from "./use-progress";

export function ProgressNote() {
  const { completed, total, reset } = useLabProgress();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {completed === 0
          ? "Nothing is checked yet. That is the start of the lab. Checks stay in this browser and are not sent anywhere."
          : completed === total
            ? `All ${total} drills are checked on this browser.`
            : `${completed} of ${total} drills are fully checked on this browser. A drill counts when every step in it is ticked.`}
      </p>
      <Button
        type="button"
        variant="outline"
        className="shrink-0"
        onClick={() => {
          if (window.confirm("Clear every check stored in this browser?")) reset();
        }}
      >
        Clear checks
      </Button>
    </div>
  );
}

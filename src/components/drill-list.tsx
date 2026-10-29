"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { drillComplete, useLabProgress } from "./use-progress";

export function DrillList({
  drills,
}: {
  drills: {
    href: string;
    number: number;
    title: string;
    minutes: number;
    outcome: string;
    stepIds: string[];
  }[];
}) {
  const { checked } = useLabProgress();

  return (
    <ol className="mt-8">
      {drills.map((drill) => {
        const done = drillComplete(drill.stepIds, checked);
        return (
          <li key={drill.href} className="border-t border-border py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 className="text-2xl">
                <Link href={drill.href} className="hover:text-stamp">
                  {drill.number}. {drill.title}
                </Link>
              </h2>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{drill.minutes} min</span>
                <Badge variant="outline" className={done ? "border-pine/40 text-pine" : ""}>
                  {done ? "Checked" : "Not yet"}
                </Badge>
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{drill.outcome}</p>
          </li>
        );
      })}
    </ol>
  );
}

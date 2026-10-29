"use client";

import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { DrillNeighbor } from "@/content";
import type { Block, Drill } from "@/content/types";
import { cn } from "@/lib/utils";

import { Rich } from "./rich-text";
import { drillComplete, useLabProgress } from "./use-progress";

function CopyButton({ text, label, tone }: { text: string; label: string; tone: "paper" | "ink" }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 1800);
  }

  const labelText = state === "copied" ? "Copied" : state === "failed" ? "Select and copy" : "Copy";

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      onClick={onCopy}
      aria-label={label}
      className={
        tone === "paper"
          ? "text-paper hover:bg-white/10 hover:text-paper"
          : "text-ink/70 hover:bg-ink/5 hover:text-ink"
      }
    >
      {labelText}
    </Button>
  );
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        if (block.kind === "p") {
          return (
            <p key={index} className="text-[15px] leading-relaxed text-ink/90">
              <Rich text={block.text} />
            </p>
          );
        }
        if (block.kind === "ul") {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-ink/90">
              {block.items.map((item) => (
                <li key={item}>
                  <Rich text={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.kind === "command") {
          return (
            <figure key={index} className="overflow-hidden rounded-md bg-terminal text-paper">
              <figcaption className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-1.5 font-mono text-[11px] tracking-wide text-paper/70">
                <span>{block.title ?? "bash"}</span>
                <CopyButton text={block.code} label="Copy command" tone="paper" />
              </figcaption>
              <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed">
                <code>{block.code}</code>
              </pre>
            </figure>
          );
        }
        if (block.kind === "file") {
          return (
            <figure key={index} className="overflow-hidden rounded-md border border-border bg-card">
              <figcaption className="flex items-center justify-between gap-3 border-b border-border px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
                <span>{block.path}</span>
                <CopyButton text={block.code} label={`Copy ${block.path}`} tone="ink" />
              </figcaption>
              <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-ink">
                <code>{block.code}</code>
              </pre>
            </figure>
          );
        }
        if (block.kind === "expected") {
          return (
            <details key={index} className="rounded-md border border-dashed border-brass/50 bg-brass/8">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-brass">
                What you should see, after you have tried
              </summary>
              <pre className="overflow-x-auto px-3 pb-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-ink/90">
                {block.code}
              </pre>
            </details>
          );
        }
        if (block.kind === "warn") {
          return (
            <aside key={index} className="border-l-2 border-stamp bg-stamp/6 px-3 py-2 text-sm leading-relaxed">
              <Rich text={block.text} />
            </aside>
          );
        }
        return (
          <aside key={index} className="border-l-2 border-pine bg-pine/6 px-3 py-2 text-sm leading-relaxed">
            <Rich text={block.text} />
          </aside>
        );
      })}
    </div>
  );
}

export function DrillView({
  drill,
  moduleHref,
  drillCount,
  prev,
  next,
}: {
  drill: Drill;
  moduleHref: string;
  drillCount: number;
  prev: DrillNeighbor | null;
  next: DrillNeighbor | null;
}) {
  const { checked, toggle } = useLabProgress();
  const doneCount = drill.steps.filter((step) => checked[step.id]).length;
  const complete = drillComplete(
    drill.steps.map((step) => step.id),
    checked,
  );

  return (
    <article className="mx-auto max-w-3xl px-5 py-8 md:px-8 md:py-12">
      <p className="text-sm text-muted-foreground">
        <Link href={moduleHref} className="hover:text-stamp">
          {drill.module === "aws" ? "EC2 and S3" : drill.module === "docker" ? "Docker" : "Git"}
        </Link>
        <span aria-hidden="true"> · </span>
        Drill {drill.number} of {drillCount}
      </p>
      <h1 className="mt-2 text-4xl leading-tight tracking-tight md:text-5xl">{drill.title}</h1>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{drill.minutes} min</Badge>
        <Badge variant="outline" className={complete ? "border-pine/40 text-pine" : ""}>
          {doneCount} of {drill.steps.length} steps checked
        </Badge>
      </div>
      <p className="mt-5 text-lg leading-relaxed text-ink/85">{drill.outcome}</p>

      <aside className="mt-6 border border-border bg-card px-4 py-3">
        <p className="text-xs font-medium tracking-[0.14em] text-stamp uppercase">Show the instructor</p>
        <p className="mt-1 text-sm leading-relaxed">
          <Rich text={drill.handIn} />
        </p>
      </aside>

      <ol className="mt-10 space-y-10">
        {drill.steps.map((step, index) => (
          <li key={step.id} className="scroll-mt-24">
            <div className="flex gap-3">
              <Checkbox
                id={step.id}
                checked={Boolean(checked[step.id])}
                onCheckedChange={() => toggle(step.id)}
                className="mt-1 size-5"
                aria-label={`Mark step ${index + 1} done`}
              />
              <div className="min-w-0 flex-1">
                <label htmlFor={step.id} className="cursor-pointer text-2xl leading-snug">
                  {index + 1}. {step.title}
                </label>
                <div className="mt-3">
                  <Blocks blocks={step.blocks} />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <Separator className="my-10" />

      <section>
        <h2 className="text-2xl">Say these out loud</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Answer before you open the note. The note is a check, not the assignment.
        </p>
        <div className="mt-4 space-y-3">
          {drill.questions.map((question) => (
            <details key={question.q} className="border border-border bg-card px-4 py-3">
              <summary className="cursor-pointer text-[15px] leading-relaxed font-medium">
                {question.q}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-ink/80">{question.a}</p>
            </details>
          ))}
        </div>
      </section>

      {drill.stretch ? (
        <section className="mt-10">
          <h2 className="text-2xl">{drill.stretch.title}</h2>
          <div className="mt-4">
            <Blocks blocks={drill.stretch.blocks} />
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-2xl">Ways this drill usually goes wrong</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
          {drill.mistakes.map((mistake) => (
            <li key={mistake}>{mistake}</li>
          ))}
        </ul>
      </section>

      <aside className="mt-10 border-l-2 border-pine bg-pine/6 px-4 py-3">
        <p className="text-xs font-medium tracking-[0.14em] text-pine uppercase">Checkpoint</p>
        <p className="mt-1 text-[15px] leading-relaxed">{drill.checkpoint}</p>
      </aside>

      <nav className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {prev ? (
          <Link href={prev.href} className={cn(buttonVariants({ variant: "outline" }), "h-auto py-2 whitespace-normal")}>
            Previous · {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={next.href} className={cn(buttonVariants({ size: "lg" }), "h-auto py-2 whitespace-normal")}>
            Next · {next.title}
          </Link>
        ) : (
          <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
            Back to the three sessions
          </Link>
        )}
      </nav>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DrillList } from "@/components/drill-list";
import { getModule, modules } from "@/content";

export function generateStaticParams() {
  return modules.map((mod) => ({ module: mod.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module: moduleId } = await params;
  const mod = getModule(moduleId);
  return { title: mod?.title ?? "Session" };
}

export default function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main id="content" className="mx-auto max-w-5xl px-5 py-10 md:px-8">
          <p className="text-sm text-muted-foreground">Opening the session…</p>
        </main>
      }
    >
      <ModuleBody params={params} />
    </Suspense>
  );
}

async function ModuleBody({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleId } = await params;
  const mod = getModule(moduleId);
  if (!mod) notFound();

  const minutes = mod.drills.reduce((sum, drill) => sum + drill.minutes, 0);

  return (
    <main id="content" className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-medium tracking-[0.18em] text-stamp uppercase">
        Session {mod.number} · {mod.hours}
      </p>
      <h1 className="mt-3 text-5xl leading-tight tracking-tight">{mod.title}</h1>
      <p className="mt-2 text-lg text-brass">{mod.kicker}</p>
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed">{mod.summary}</p>
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        {mod.drills.length} drills · about {minutes} minutes if nothing fights back
      </p>

      <DrillList
        drills={mod.drills.map((drill) => ({
          href: `/${mod.id}/${drill.slug}`,
          number: drill.number,
          title: drill.title,
          minutes: drill.minutes,
          outcome: drill.outcome,
          stepIds: drill.steps.map((step) => step.id),
        }))}
      />

      <section className="mt-10 border border-border bg-card px-4 py-4">
        <h2 className="text-2xl">You are ready for the next session when</h2>
        <p className="mt-2 text-[15px] leading-relaxed">{mod.readyWhen}</p>
      </section>

      <section className="mt-6 border-l-2 border-brass px-4 py-1">
        <h2 className="text-xl">If your machine is already messy</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/85">{mod.messy}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl">For the instructor</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
          {mod.beforeClass.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/prep" className="underline decoration-stamp/40 underline-offset-2 hover:decoration-stamp">
            Machine prep
          </Link>
        </p>
      </section>
    </main>
  );
}

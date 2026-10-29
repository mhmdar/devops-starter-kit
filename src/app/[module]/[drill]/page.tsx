import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DrillView } from "@/components/drill-view";
import { drillNeighbors, getDrill, modules } from "@/content";

export function generateStaticParams() {
  return modules.flatMap((mod) =>
    mod.drills.map((drill) => ({
      module: mod.id,
      drill: drill.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string; drill: string }>;
}): Promise<Metadata> {
  const { module: moduleId, drill: slug } = await params;
  const found = getDrill(moduleId, slug);
  return { title: found?.drill.title ?? "Drill" };
}

export default function DrillPage({
  params,
}: {
  params: Promise<{ module: string; drill: string }>;
}) {
  return (
    <main id="content">
      <Suspense fallback={<p className="mx-auto max-w-3xl px-5 py-8 text-sm text-muted-foreground md:px-8">Opening the drill…</p>}>
        <DrillBody params={params} />
      </Suspense>
    </main>
  );
}

async function DrillBody({
  params,
}: {
  params: Promise<{ module: string; drill: string }>;
}) {
  const { module: moduleId, drill: slug } = await params;
  const found = getDrill(moduleId, slug);
  if (!found) notFound();

  const neighbors = drillNeighbors(moduleId, slug);

  return (
    <DrillView
      drill={found.drill}
      moduleHref={`/${found.module.id}`}
      drillCount={found.module.drills.length}
      prev={neighbors.prev}
      next={neighbors.next}
    />
  );
}

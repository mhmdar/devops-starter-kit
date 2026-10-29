import Link from "next/link";

import { ProgressNote } from "@/components/progress-note";
import { buttonVariants } from "@/components/ui/button";
import { modules } from "@/content";
import { cn } from "@/lib/utils";

const rules = [
  {
    title: "A scratch folder",
    text: "Do the work in ~/drillbook-git, ~/drillbook-docker, and ~/drillbook-aws. Not inside this project.",
  },
  {
    title: "Bash",
    text: "The commands are bash. On Windows, use Git Bash. If a line contains << and the shell rejects it, you are in the wrong shell.",
  },
  {
    title: "No secrets in git",
    text: "The token in the Git drill is fake. A .pem file and an AWS secret key are not. Do not commit them, and do not paste them into the report.",
  },
  {
    title: "SSH from your IP",
    text: "Port 22 allows the address you have right now, as a /32. The drills never use 0.0.0.0/0.",
  },
  {
    title: "Cleanup is the lab",
    text: "Stop the container. Terminate the instance. Delete the bucket. A stopped EC2 instance still has a disk.",
  },
];

export default function Home() {
  return (
    <main id="content">
      <section className="mx-auto max-w-5xl px-5 pt-12 pb-8 md:px-8 md:pt-16">
        <p className="text-xs font-medium tracking-[0.18em] text-stamp uppercase">
          Undergraduate lab · three sessions
        </p>
        <h1 className="mt-3 max-w-3xl text-5xl leading-[1.05] tracking-tight md:text-6xl">
          Run the command. Read what came back.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Twelve drills for a first DevOps course. Git on your own machine, Docker until two containers can
          talk, then one EC2 instance and one S3 bucket, including the part where you delete them.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/git/two-commits" className={cn(buttonVariants({ size: "lg" }))}>
            Start with Git
          </Link>
          <Link href="/prep" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
            Check your machine
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 md:px-8">
        <h2 className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">Lab rules</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {rules.map((rule, index) => (
            <div
              key={rule.title}
              className={`border-t border-border pt-3 ${index === rules.length - 1 ? "sm:col-span-2" : ""}`}
            >
              <dt className="font-heading text-xl">{rule.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{rule.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto mt-14 max-w-5xl px-5 md:px-8">
        <h2 className="text-sm font-medium tracking-[0.16em] text-muted-foreground uppercase">Sessions</h2>
        <ol className="mt-2">
          {modules.map((mod) => (
            <li key={mod.id} className="grid gap-3 border-t border-border py-6 md:grid-cols-[5rem_1fr_auto] md:items-start">
              <p className="font-heading text-4xl text-stamp">{mod.number}</p>
              <div>
                <h3 className="text-3xl">
                  <Link href={`/${mod.id}`} className="hover:text-stamp">
                    {mod.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-brass">{mod.kicker}</p>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed">{mod.summary}</p>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  {mod.hours} · {mod.drills.length} drills
                </p>
              </div>
              <Link
                href={`/${mod.id}/${mod.drills[0].slug}`}
                className={cn(buttonVariants({ variant: "outline" }), "md:mt-1")}
              >
                Open drill 1
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-6 max-w-5xl px-5 md:px-8">
        <div className="border border-border bg-card px-5 py-5 md:px-6">
          <h2 className="text-2xl">How a drill works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed">
            <li>Read the outcome. That is the thing you should be able to do when you stand up.</li>
            <li>Run the commands in order, in the folder the step names.</li>
            <li>Open “What you should see” only after you have a result of your own. Ids will differ. Meaning should match.</li>
            <li>Tick the step when it is true, not when you have scrolled past it.</li>
            <li>Answer the questions out loud. Then open the note.</li>
            <li>Keep the “show the instructor” output. Do not include a key, a .pem file, or a presigned URL that still works.</li>
          </ol>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl px-5 md:px-8">
        <h2 className="text-2xl">For the instructor</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Project this site, or give students the URL. The drills are written to them. Each session page has a
          five-minute demo to do before they start, and each drill names the command output to collect.
        </p>
        <ul className="mt-4 max-w-2xl list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>Session 1 needs Git 2.23 or newer so git switch exists. No hosting account.</li>
          <li>Session 2 needs a running Docker daemon. Images will download on the first run.</li>
          <li>
            Session 3 needs a sandbox, an AWS Academy lab, or a personal account with a budget alert. Plan on SSH
            taking longer than the commands do. Drill 4 is the assignment.
          </li>
        </ul>
        <div className="mt-6">
          <ProgressNote />
        </div>
      </section>
    </main>
  );
}

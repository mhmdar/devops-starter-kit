import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Prep",
};

const checks = [
  {
    tool: "Git",
    command: "git --version\ngit switch -h",
    ready: "Any current Git where git switch prints help rather than “not a git command”. That is Git 2.23 or newer. Install from git-scm.com/downloads if the command is missing.",
    href: "https://git-scm.com/downloads",
    link: "git-scm.com downloads",
  },
  {
    tool: "Docker",
    command: "docker version",
    ready: "You need a Client section and a Server section. If the server cannot be reached, start Docker Desktop or the engine. The first drills pull hello-world, nginx:alpine, python:3.12-slim, and alpine. That is a few hundred megabytes.",
    href: "https://docs.docker.com/get-started/get-docker/",
    link: "Docker install guide",
  },
  {
    tool: "AWS CLI",
    command: "aws --version",
    ready: "The version string should start with aws-cli/2. Version 1 is a different tool. You also need an account your instructor named, or a personal account you are willing to put a budget on. The EC2 and S3 session does not need the CLI until that day.",
    href: "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html",
    link: "AWS CLI v2 install guide",
  },
];

export default function PrepPage() {
  return (
    <main id="content" className="mx-auto max-w-3xl px-5 py-10 md:px-8 md:py-14">
      <p className="text-xs font-medium tracking-[0.18em] text-stamp uppercase">Before the room starts</p>
      <h1 className="mt-3 text-5xl leading-tight tracking-tight">Check the machine</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        Three commands. If each one behaves as described, you can start the session it belongs to. Do this the day
        before, not when the first drill is already on the projector.
      </p>

      <ol className="mt-10 space-y-8">
        {checks.map((check, index) => (
          <li key={check.tool} className="border-t border-border pt-6">
            <h2 className="text-3xl">
              {index + 1}. {check.tool}
            </h2>
            <pre className="mt-3 overflow-x-auto rounded-md bg-terminal p-3 font-mono text-[13px] leading-relaxed text-paper">
              <code>{check.command}</code>
            </pre>
            <p className="mt-3 text-[15px] leading-relaxed">{check.ready}</p>
            <p className="mt-2 text-sm">
              <a
                href={check.href}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-stamp/40 underline-offset-2 hover:decoration-stamp"
              >
                {check.link}
              </a>
            </p>
          </li>
        ))}
      </ol>

      <section className="mt-10 border border-border bg-card px-4 py-4">
        <h2 className="text-2xl">Accounts</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>Git: none. The remote in the last Git drill is a bare folder on your machine.</li>
          <li>Docker: none for the public images these drills pull. You need a running daemon, not a Docker Hub account.</li>
          <li>
            AWS: a classroom sandbox, an AWS Academy Learner Lab, or a personal account. Not an employer account. Not
            the root user. Turn on a budget alert if you can open billing. The last AWS drill deletes what you
            created, and it is part of the work.
          </li>
        </ul>
      </section>

      <div className="mt-8">
        <Link href="/git/two-commits" className={cn(buttonVariants({ size: "lg" }))}>
          Start with Git
        </Link>
      </div>
    </main>
  );
}

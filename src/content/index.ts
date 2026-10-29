import { awsDrills } from "./aws";
import { dockerDrills } from "./docker";
import { gitDrills } from "./git";
import type { Drill, Module, ModuleId, ProgressItem } from "./types";

export const modules: Module[] = [
  {
    id: "git",
    number: "01",
    title: "Git",
    kicker: "A repository on your own machine",
    summary:
      "Two commits you can explain, a branch that is only a label, a conflict you read out loud, and a remote that is a folder rather than a website.",
    hours: "About 2 hours",
    readyWhen:
      "You can say what is in the working tree, what is in the index, and what is in the last commit. You can also say why a file that was never committed did not appear in the clone.",
    messy:
      "If the repository is tangled, move it aside with mv \"$HOME/drillbook-git\" \"$HOME/drillbook-git-attempt1\" and start drill 1 again. Keep the attempt if you want to look at it. Do not delete a repository you did not create for this lab.",
    beforeClass: [
      "On the projector, git init, one commit, and git log --oneline. Say the commit message out loud and reject one that says \"update\".",
      "Show git status in three states: untracked, staged, and clean. The drills assume students can read that output.",
      "If someone lands in vim, the room will stall. Show Esc, :q!, Enter, before they start.",
      "No GitHub account is required. Drill 4 pushes to a bare folder in the home directory.",
    ],
    drills: gitDrills,
  },
  {
    id: "docker",
    number: "02",
    title: "Docker",
    kicker: "A process with a boundary",
    summary:
      "Run a container you did not build, build one image, watch a write disappear, then start two containers that find each other by name.",
    hours: "About 2 hours",
    readyWhen:
      "You can explain why deleting a container does not delete the image, why a file written inside a container vanished, and why localhost inside one container is not the other container.",
    messy:
      "Names left from a previous attempt will block the next one. From a bash shell: docker rm -f drillbook-web menu-api menu-api-closed scratch, then docker volume rm drillbook-notes. If the Compose stack is still up, cd \"$HOME/drillbook-docker\" and docker compose down. Ignore errors for names that are not there.",
    beforeClass: [
      "docker version must show a Server section on the student machines before the session. A client with no daemon wastes the hour.",
      "Demo docker run -d --name drillbook-web -p 8088:80 nginx:alpine, curl it, then docker rm -f drillbook-web. Say the left side of -p is their machine.",
      "Tell them the menu API is the standard library on purpose. Flask can wait. One process is enough to see an image, a container, and a port.",
      "The localhost failure in the Compose drill is the point. Do not help them \"fix\" wget to 127.0.0.1.",
    ],
    drills: dockerDrills,
  },
  {
    id: "aws",
    number: "03",
    title: "EC2 and S3",
    kicker: "One machine, one bucket, then neither",
    summary:
      "Prove which account the CLI will change, launch a single t3.micro, store a private object behind a link that expires, and delete all of it.",
    hours: "About half an afternoon",
    readyWhen:
      "You can show a stopped-then-terminated instance, a 403 on the bare S3 URL, and NotFound for the security group, key pair, and bucket you created.",
    messy:
      "Do not launch a second instance because the first SSH attempt failed. source \"$HOME/drillbook-aws/lab-ids.sh\" and read the id you already saved. The cleanup drill is how you delete what this lab created. It is not a sweep of a shared account.",
    beforeClass: [
      "Decide the account before the session: one sandbox per student, an AWS Academy Learner Lab, or a dedicated class account. Do not send students into an account that holds anything else with broad EC2 and S3 policies.",
      "Demo aws sts get-caller-identity and read the Arn. If it contains :root, stop the room and fix that before anyone calls run-instances.",
      "Say the cleanup drill is the assignment, not optional homework. SSH is where the session runs long. The usual failures are the security group, a changed campus IP, and the username ec2-user.",
      "Tell them not to open port 22 to 0.0.0.0/0 and not to allocate an Elastic IP. Both are the support tickets this lab is written to avoid.",
    ],
    drills: awsDrills,
  },
];

const moduleIds = new Set<ModuleId>(["git", "docker", "aws"]);

for (const mod of modules) {
  if (!moduleIds.has(mod.id)) {
    throw new Error(`Unknown module id ${mod.id}`);
  }
  const slugs = new Set<string>();
  const stepIds = new Set<string>();
  mod.drills.forEach((drill, index) => {
    if (drill.module !== mod.id) {
      throw new Error(`Drill ${drill.slug} is filed under ${mod.id} but says ${drill.module}`);
    }
    if (drill.number !== index + 1) {
      throw new Error(`Drill ${drill.slug} number is ${drill.number}, expected ${index + 1}`);
    }
    if (slugs.has(drill.slug)) {
      throw new Error(`Duplicate slug ${drill.slug}`);
    }
    slugs.add(drill.slug);
    for (const step of drill.steps) {
      if (stepIds.has(step.id)) {
        throw new Error(`Duplicate step id ${step.id}`);
      }
      stepIds.add(step.id);
    }
  });
}

export function getModule(id: string): Module | undefined {
  return modules.find((mod) => mod.id === id);
}

export function getDrill(moduleId: string, slug: string): { module: Module; drill: Drill } | undefined {
  const session = getModule(moduleId);
  const drill = session?.drills.find((item) => item.slug === slug);
  if (!session || !drill) return undefined;
  return { module: session, drill };
}

export type DrillNeighbor = {
  href: string;
  title: string;
  moduleTitle: string;
};

export function drillNeighbors(moduleId: string, slug: string): {
  prev: DrillNeighbor | null;
  next: DrillNeighbor | null;
} {
  const flat = modules.flatMap((mod) =>
    mod.drills.map((drill) => ({
      href: `/${mod.id}/${drill.slug}`,
      title: drill.title,
      moduleTitle: mod.title,
      key: `${mod.id}/${drill.slug}`,
    })),
  );
  const index = flat.findIndex((item) => item.key === `${moduleId}/${slug}`);
  if (index === -1) return { prev: null, next: null };
  const prev = flat[index - 1];
  const next = flat[index + 1];
  return {
    prev: prev ? { href: prev.href, title: prev.title, moduleTitle: prev.moduleTitle } : null,
    next: next ? { href: next.href, title: next.title, moduleTitle: next.moduleTitle } : null,
  };
}

export const progressIndex: ProgressItem[] = modules.flatMap((mod) =>
  mod.drills.map((drill) => ({
    key: `${mod.id}/${drill.slug}`,
    title: drill.title,
    href: `/${mod.id}/${drill.slug}`,
    module: mod.id,
    stepIds: drill.steps.map((step) => step.id),
  })),
);

export function moduleStepIds(moduleId: ModuleId): string[][] {
  return progressIndex.filter((item) => item.module === moduleId).map((item) => item.stepIds);
}

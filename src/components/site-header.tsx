import Link from "next/link";

import { ProgressMeter } from "./progress-meter";

const links = [
  { href: "/git", label: "Git" },
  { href: "/docker", label: "Docker" },
  { href: "/aws", label: "EC2 & S3" },
  { href: "/prep", label: "Prep" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-3 md:flex-row md:items-center md:gap-x-6 md:px-8">
        <div className="flex items-center justify-between md:contents">
          <Link href="/" className="font-heading text-2xl tracking-tight text-ink">
            Drillbook
          </Link>
          <div className="md:order-3">
            <ProgressMeter />
          </div>
        </div>
        <nav aria-label="Sessions" className="flex flex-wrap gap-x-4 gap-y-1 text-sm md:order-2 md:flex-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-ink/80 hover:text-stamp">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-1 px-5 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p>Drillbook · undergraduate lab</p>
        <p>Stop the container. Terminate the instance. Delete the bucket.</p>
      </div>
    </footer>
  );
}

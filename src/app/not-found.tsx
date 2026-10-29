import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main id="content" className="mx-auto max-w-3xl px-5 py-16 md:px-8">
      <p className="text-xs font-medium tracking-[0.18em] text-stamp uppercase">404</p>
      <h1 className="mt-3 text-5xl tracking-tight">That drill is not in the book.</h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
        The three sessions are Git, Docker, and EC2 with S3. Anything else in the address bar is a wrong page, not a
        hidden lab.
      </p>
      <div className="mt-8">
        <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
          Back to the sessions
        </Link>
      </div>
    </main>
  );
}

const TOKEN = /(`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;

export function Rich({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return (
            <code
              key={index}
              className="rounded bg-ink/6 px-1 py-0.5 font-mono text-[0.88em] text-ink"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        const link = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(part);
        if (link) {
          return (
            <a
              key={index}
              href={link[2]}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-stamp/40 underline-offset-2 hover:decoration-stamp"
            >
              {link[1]}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

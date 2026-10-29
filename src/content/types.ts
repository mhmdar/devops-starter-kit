export type ModuleId = "git" | "docker" | "aws";

export type Block =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "command"; code: string; title?: string }
  | { kind: "expected"; code: string }
  | { kind: "file"; path: string; code: string }
  | { kind: "warn"; text: string }
  | { kind: "note"; text: string };

export type Step = {
  id: string;
  title: string;
  blocks: Block[];
};

export type Question = {
  q: string;
  a: string;
};

export type Drill = {
  module: ModuleId;
  slug: string;
  number: number;
  title: string;
  minutes: number;
  outcome: string;
  handIn: string;
  steps: Step[];
  questions: Question[];
  mistakes: string[];
  checkpoint: string;
  stretch?: {
    title: string;
    blocks: Block[];
  };
};

export type Module = {
  id: ModuleId;
  number: string;
  title: string;
  kicker: string;
  summary: string;
  hours: string;
  readyWhen: string;
  messy: string;
  beforeClass: string[];
  drills: Drill[];
};

export type ProgressItem = {
  key: string;
  title: string;
  href: string;
  module: ModuleId;
  stepIds: string[];
};

export function p(text: string): Block {
  return { kind: "p", text };
}

export function ul(items: string[]): Block {
  return { kind: "ul", items };
}

export function cmd(code: string, title?: string): Block {
  return { kind: "command", code: code.replace(/^\n/, "").replace(/\n$/, ""), title };
}

export function expected(code: string): Block {
  return { kind: "expected", code: code.replace(/^\n/, "").replace(/\n$/, "") };
}

export function file(path: string, code: string): Block {
  return { kind: "file", path, code: code.replace(/^\n/, "").replace(/\n$/, "") };
}

export function warn(text: string): Block {
  return { kind: "warn", text };
}

export function note(text: string): Block {
  return { kind: "note", text };
}

import { readFileSync } from "node:fs";

import { labFileOnDisk } from "./files";

for (const [name, file] of Object.entries(labFileOnDisk)) {
  const onDisk = readFileSync(file.diskPath, "utf8").trim();
  const canonical = file.contents.trim();
  if (onDisk !== canonical) {
    throw new Error(
      `${file.diskPath} does not match the lab file shown in the drills (${name}).`,
    );
  }
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

let cachedProjectRoot: string | null = null;

/**
 * Resolve the repository root (directory containing package.json).
 * Works when the app runs from compiled `dist/` on Render or locally via tsx.
 */
export const getProjectRoot = (): string => {
  if (cachedProjectRoot) return cachedProjectRoot;

  let dir = path.dirname(fileURLToPath(import.meta.url));
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      cachedProjectRoot = dir;
      return dir;
    }
    dir = path.dirname(dir);
  }

  cachedProjectRoot = process.cwd();
  return cachedProjectRoot;
};

export const projectPath = (...segments: string[]): string =>
  path.join(getProjectRoot(), ...segments);

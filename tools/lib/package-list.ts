// MIT © 2017 azu
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagesDirectory = path.join(__dirname, "../../packages");

export const getPackages = (blacklistModules: string[] = []) => {
  return fs
    .readdirSync(packagesDirectory)
    .filter((pkgName) => !blacklistModules.includes(pkgName))
    .sort()
    .map((pkgName) => path.resolve(packagesDirectory, pkgName));
};

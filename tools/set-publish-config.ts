// MIT © 2017 azu
import fs from "node:fs";
import path from "node:path";
import { getPackages } from "./lib/package-list.js";

interface PackageJSON extends Record<string, unknown> {
  publishConfig?: {
    access?: string;
  };
}

const readPackageJson = (packageJsonPath: string): PackageJSON => {
  return JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as PackageJSON;
};

const updatePackage = <TPackage extends PackageJSON>(
  pkg: TPackage,
  updatablePkg: Partial<TPackage>,
): TPackage => {
  return Object.assign({}, pkg, updatablePkg);
};

/**
 * Add
 *
 * ```
 * "publishConfig": {
 *   "access": "public"
 * }
 * ```
 *
 * Keep package publishing metadata explicit.
 */
getPackages().forEach((packageDirectory) => {
  const packageJSONPath = path.join(packageDirectory, "package.json");
  const pkg = readPackageJson(packageJSONPath);
  const newPkg = updatePackage(pkg, {
    publishConfig: {
      access: "public",
    },
  });
  fs.writeFileSync(packageJSONPath, JSON.stringify(newPkg, null, 2), "utf-8");
});

// MIT © 2017 azu
import fs from "node:fs";
import path from "node:path";
import { getPackages } from "./lib/package-list.js";
const updatePackage = (pkg, updatablePkg) => {
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
  const pkg = JSON.parse(fs.readFileSync(packageJSONPath, "utf-8"));
  const newPkg = updatePackage(pkg, {
    publishConfig: {
      access: "public",
    },
  });
  fs.writeFileSync(packageJSONPath, JSON.stringify(newPkg, null, 2), "utf-8");
});

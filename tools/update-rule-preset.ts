// MIT © 2017 azu
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPackages } from "./lib/package-list.js";

interface PackageJSON extends Record<string, unknown> {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blacklistModules = [
  "textlint-report-helper-for-google-preset",
  "textlint-rule-preset-google",
];

const readPackageJson = (packageJsonPath: string): PackageJSON => {
  return JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as PackageJSON;
};

const updatePackageDependencies = (
  pkg: PackageJSON,
  dependencies: Record<string, string>,
): PackageJSON => {
  const updatedDependencies = Object.assign(
    {},
    pkg.dependencies ?? {},
    dependencies,
  );
  return Object.assign({}, pkg, {
    dependencies: updatedDependencies,
  });
};

const updatePackage = (
  pkg: PackageJSON,
  updatablePkg: Partial<PackageJSON>,
): PackageJSON => {
  return Object.assign({}, pkg, updatablePkg);
};

/**
 * Update textlint-rule-preset-google
 */
const packageNames = getPackages(blacklistModules)
  .map((packageDirectory) => {
    const packageJSONPath = path.join(packageDirectory, "package.json");
    const pkg = readPackageJson(packageJSONPath);
    return typeof pkg.name === "string" ? pkg.name : undefined;
  })
  .filter(
    (packageName): packageName is string => typeof packageName === "string",
  );

/**
 * create "dependencies"
 * @param packageNames
 * @param version
 * @returns {{}}
 */
const createRuleDependencies = (
  packageNamesToLink: string[],
  version: string,
): Record<string, string> => {
  const dependencies: Record<string, string> = {};
  packageNamesToLink.forEach((packageName) => {
    dependencies[packageName] = `^${version}`;
  });
  return dependencies;
};

/**
 * create "rules" and "rulesConfig" module source text
 * @param packageNames
 */
const createRuleAndConfig = (packageNamesToRender: string[]): string => {
  const imports: string[] = [];
  const ruleEntries: string[] = [];
  const rulesConfigEntries: string[] = [];
  const toIdentifier = (value: string): string =>
    value.replace(/-([a-z])/g, (_match: string, char: string) => {
      return char.toUpperCase();
    });

  packageNamesToRender.forEach((packageName) => {
    const shortName = packageName.replace(
      "@textlint-rule/textlint-rule-google-",
      "",
    );
    const identifier = toIdentifier(shortName);
    imports.push(`import ${identifier} from "${packageName}";`);
    ruleEntries.push(`        "${shortName}": ${identifier}`);
    rulesConfigEntries.push(`        "${shortName}": true`);
  });

  return `${imports.join("\n")}

// prettier-ignore
const rule = {
    "rules": {
${ruleEntries.join(",\n")}
    },
    "rulesConfig": {
${rulesConfigEntries.join(",\n")}
    }
};

export default rule;
`;
};

const rootPackageJsonPath = path.join(__dirname, "../package.json");
const rootPackageJson = readPackageJson(rootPackageJsonPath);
if (typeof rootPackageJson.version !== "string") {
  throw new Error("Expected version field in root package.json");
}

const monorepoVersion = rootPackageJson.version;
const packagesDirectory = path.join(__dirname, "../packages");

/**
 * Version = package.json version
 */
getPackages().forEach((packageDirectory) => {
  const packageJSONPath = path.join(packageDirectory, "package.json");
  const pkg = readPackageJson(packageJSONPath);
  const newPkg = updatePackage(pkg, {
    version: monorepoVersion,
  });
  fs.writeFileSync(packageJSONPath, JSON.stringify(newPkg, null, 2), "utf-8");
});

// package.json
console.info("Start to update package.json");
const rulePresetPkgPath = path.join(
  packagesDirectory,
  "textlint-rule-preset-google/package.json",
);
const rulePresetPkg = readPackageJson(rulePresetPkgPath);
const ruleDependencies = createRuleDependencies(packageNames, monorepoVersion);
const newRulePresetPkg = updatePackageDependencies(
  rulePresetPkg,
  ruleDependencies,
);
fs.writeFileSync(
  rulePresetPkgPath,
  JSON.stringify(newRulePresetPkg, null, 2),
  "utf-8",
);
console.info("Updated package.json");

// src
console.info("Start to src/textlint-rule-preset-google.ts");
const srcPath = path.join(
  packagesDirectory,
  "textlint-rule-preset-google/src/textlint-rule-preset-google.ts",
);
const srcContent = createRuleAndConfig(packageNames);
fs.writeFileSync(srcPath, srcContent, "utf-8");
console.info("Updated package.json");

// MIT © 2017 azu
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPackages } from "./lib/package-list.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blacklistModules = [
  "textlint-report-helper-for-google-preset",
  "textlint-rule-preset-google",
];
const updatePackageDepencencies = (pkg, dependencies) => {
  const updatedDependencies = Object.assign({}, pkg.dependencies, dependencies);
  return Object.assign({}, pkg, {
    dependencies: updatedDependencies,
  });
};
const updatePackage = (pkg, updatablePkg) => {
  return Object.assign({}, pkg, updatablePkg);
};
/**
 * Update textlint-rule-preset-google
 */
const packageNames = getPackages(blacklistModules).map((packageDirectory) => {
  const packageJSONPath = path.join(packageDirectory, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packageJSONPath, "utf-8"));
  return pkg.name;
});

/**
 * create "dependencies"
 * @param packageNames
 * @param version
 * @returns {{}}
 */
const createRuleDependencies = (packageNames, version) => {
  const dependencies = {};
  packageNames.forEach((packageName) => {
    dependencies[packageName] = `^${version}`;
  });
  return dependencies;
};
/**
 * create "rules" and "rulesConfig" module source text
 * @param packageNames
 */
const createRuleAndConfig = (packageNames) => {
  const imports = [];
  const ruleEntries = [];
  const rulesConfigEntries = [];
  const toIdentifier = (value: string) =>
    value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
  packageNames.forEach((packageName) => {
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

const monorepoVersion = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
).version as string;
const packagesDirectory = path.join(__dirname, "../packages");
// each package version fixed

/**
 * Version = package.json version
 */
getPackages().forEach((packageDirectory) => {
  const packageJSONPath = path.join(packageDirectory, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packageJSONPath, "utf-8"));
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
const rulePresetPkg = JSON.parse(fs.readFileSync(rulePresetPkgPath, "utf-8"));
const ruleDependencies = createRuleDependencies(packageNames, monorepoVersion);
const newRulePresetPkg = updatePackageDepencencies(
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

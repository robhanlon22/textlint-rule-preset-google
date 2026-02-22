// LICENSE : MIT
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import preset from "../src/textlint-rule-preset-google.js";

interface Preset {
  rules: Record<string, GoogleRuleModule>;
  rulesConfig: Record<string, boolean>;
}

interface PackageJSON extends Record<string, unknown> {
  name?: string;
  dependencies?: Record<string, string>;
}

const googleRulePackagePrefix = "@textlint-rule/textlint-rule-google-";
const packageRootDirectory = fileURLToPath(new URL("../", import.meta.url));
const workspacePackagesDirectory = path.resolve(packageRootDirectory, "..");

const readPackageJson = (packageJsonPath: string): PackageJSON => {
  return JSON.parse(fs.readFileSync(packageJsonPath, "utf-8")) as PackageJSON;
};

const toRuleKeys = (packageNames: string[]): string[] => {
  return packageNames
    .map((packageName) => packageName.replace(googleRulePackagePrefix, ""))
    .sort();
};

const getWorkspaceGoogleRulePackages = (): string[] => {
  return fs
    .readdirSync(workspacePackagesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(workspacePackagesDirectory, entry.name))
    .map((packageDirectory) => path.join(packageDirectory, "package.json"))
    .filter((packageJsonPath) => fs.existsSync(packageJsonPath))
    .map((packageJsonPath) => readPackageJson(packageJsonPath))
    .map((pkg) => pkg.name)
    .filter(
      (packageName): packageName is string =>
        typeof packageName === "string" &&
        packageName.startsWith(googleRulePackagePrefix),
    )
    .sort();
};

const getPresetGoogleRuleDependencies = (): string[] => {
  const presetPackageJsonPath = path.join(packageRootDirectory, "package.json");
  const presetPackageJson = readPackageJson(presetPackageJsonPath);
  return Object.keys(presetPackageJson.dependencies ?? {})
    .filter((dependencyName) =>
      dependencyName.startsWith(googleRulePackagePrefix),
    )
    .sort();
};

const { rules, rulesConfig } = preset as Preset;
describe("textlint-rule-preset-google", function () {
  it("should not have missing key", function () {
    const ruleKeys = Object.keys(rules).sort();
    const ruleConfigKeys = Object.keys(rulesConfig).sort();
    expect(ruleKeys).toEqual(ruleConfigKeys);
  });

  it("should keep preset rule keys synchronized with workspace google rules", function () {
    const workspaceRuleKeys = toRuleKeys(getWorkspaceGoogleRulePackages());
    const ruleKeys = Object.keys(rules).sort();
    const ruleConfigKeys = Object.keys(rulesConfig).sort();
    expect(ruleKeys).toEqual(workspaceRuleKeys);
    expect(ruleConfigKeys).toEqual(workspaceRuleKeys);
  });

  it("should keep preset dependencies synchronized with workspace google rules", function () {
    const workspaceRulePackages = getWorkspaceGoogleRulePackages();
    const presetRuleDependencies = getPresetGoogleRuleDependencies();
    expect(presetRuleDependencies).toEqual(workspaceRulePackages);
  });
});

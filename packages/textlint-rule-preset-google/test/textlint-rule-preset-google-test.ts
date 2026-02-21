// LICENSE : MIT
import assert from "node:assert";
import preset from "../src/textlint-rule-preset-google.js";

interface Preset {
  rules: Record<string, GoogleRuleModule>;
  rulesConfig: Record<string, boolean>;
}

const { rules, rulesConfig } = preset as Preset;
describe("textlint-rule-preset-google", function () {
  it("should not have missing key", function () {
    const ruleKeys = Object.keys(rules).sort();
    const ruleConfigKeys = Object.keys(rulesConfig).sort();
    assert.deepEqual(ruleKeys, ruleConfigKeys);
  });
});

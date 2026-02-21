// LICENSE : MIT
"use strict";
import assert from "node:assert";
import preset from "../src/textlint-rule-preset-google";
const rules = (preset as any).rules;
const rulesConfig = (preset as any).rulesConfig;
describe("textlint-rule-preset-google", function () {
    it("should not have missing key", function () {
        const ruleKeys = Object.keys(rules).sort();
        const ruleConfigKeys = Object.keys(rulesConfig).sort();
        assert.deepEqual(ruleKeys, ruleConfigKeys);
    });
});

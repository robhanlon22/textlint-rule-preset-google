import abbreviations from "@textlint-rule/textlint-rule-google-abbreviations";
import articles from "@textlint-rule/textlint-rule-google-articles";
import capitalization from "@textlint-rule/textlint-rule-google-capitalization";
import clauseOrder from "@textlint-rule/textlint-rule-google-clause-order";
import colons from "@textlint-rule/textlint-rule-google-colons";
import commas from "@textlint-rule/textlint-rule-google-commas";
import contractions from "@textlint-rule/textlint-rule-google-contractions";
import dashes from "@textlint-rule/textlint-rule-google-dashes";
import ellipses from "@textlint-rule/textlint-rule-google-ellipses";
import exclamationPoints from "@textlint-rule/textlint-rule-google-exclamation-points";
import hyphens from "@textlint-rule/textlint-rule-google-hyphens";
import pluralsParentheses from "@textlint-rule/textlint-rule-google-plurals-parentheses";
import possessives from "@textlint-rule/textlint-rule-google-possessives";
import quotationMarks from "@textlint-rule/textlint-rule-google-quotation-marks";
import sentenceSpacing from "@textlint-rule/textlint-rule-google-sentence-spacing";
import slashes from "@textlint-rule/textlint-rule-google-slashes";
import tone from "@textlint-rule/textlint-rule-google-tone";
import wordList from "@textlint-rule/textlint-rule-google-word-list";

// prettier-ignore
const rule = {
    "rules": {
        "abbreviations": abbreviations,
        "articles": articles,
        "capitalization": capitalization,
        "clause-order": clauseOrder,
        "colons": colons,
        "commas": commas,
        "contractions": contractions,
        "dashes": dashes,
        "ellipses": ellipses,
        "exclamation-points": exclamationPoints,
        "hyphens": hyphens,
        "plurals-parentheses": pluralsParentheses,
        "possessives": possessives,
        "quotation-marks": quotationMarks,
        "sentence-spacing": sentenceSpacing,
        "slashes": slashes,
        "tone": tone,
        "word-list": wordList
    },
    "rulesConfig": {
        "abbreviations": true,
        "articles": true,
        "capitalization": true,
        "clause-order": true,
        "colons": true,
        "commas": true,
        "contractions": true,
        "dashes": true,
        "ellipses": true,
        "exclamation-points": true,
        "hyphens": true,
        "plurals-parentheses": true,
        "possessives": true,
        "quotation-marks": true,
        "sentence-spacing": true,
        "slashes": true,
        "tone": true,
        "word-list": true
    }
};

export default rule;

import abbreviations from "@textlint-rule/textlint-rule-google-abbreviations";
import activeVoice from "@textlint-rule/textlint-rule-google-active-voice";
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
import periods from "@textlint-rule/textlint-rule-google-periods";
import pluralsParentheses from "@textlint-rule/textlint-rule-google-plurals-parentheses";
import possessives from "@textlint-rule/textlint-rule-google-possessives";
import pronouns from "@textlint-rule/textlint-rule-google-pronouns";
import quotationMarks from "@textlint-rule/textlint-rule-google-quotation-marks";
import sentenceSpacing from "@textlint-rule/textlint-rule-google-sentence-spacing";
import slashes from "@textlint-rule/textlint-rule-google-slashes";
import tables from "@textlint-rule/textlint-rule-google-tables";
import tense from "@textlint-rule/textlint-rule-google-tense";
import tone from "@textlint-rule/textlint-rule-google-tone";
import unitsOfMeasure from "@textlint-rule/textlint-rule-google-units-of-measure";
import wordList from "@textlint-rule/textlint-rule-google-word-list";

// prettier-ignore
const rule = {
    "rules": {
        "abbreviations": abbreviations,
        "active-voice": activeVoice,
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
        "periods": periods,
        "plurals-parentheses": pluralsParentheses,
        "possessives": possessives,
        "pronouns": pronouns,
        "quotation-marks": quotationMarks,
        "sentence-spacing": sentenceSpacing,
        "slashes": slashes,
        "tables": tables,
        "tense": tense,
        "tone": tone,
        "units-of-measure": unitsOfMeasure,
        "word-list": wordList
    },
    "rulesConfig": {
        "abbreviations": true,
        "active-voice": true,
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
        "periods": true,
        "plurals-parentheses": true,
        "possessives": true,
        "pronouns": true,
        "quotation-marks": true,
        "sentence-spacing": true,
        "slashes": true,
        "tables": true,
        "tense": true,
        "tone": true,
        "units-of-measure": true,
        "word-list": true
    }
};

export default rule;

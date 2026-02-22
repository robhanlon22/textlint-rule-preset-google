# @textlint-rule/textlint-rule-google-periods

Reference: [Periods | Google Developer Documentation Style Guide | Google Developers](https://developers.google.com/style/periods)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @textlint-rule/textlint-rule-google-periods

## Usage

Via `.textlintrc` (Recommended)

```json
{
  "rules": {
    "@textlint-rule/google-periods": true
  }
}
```

Via CLI

```sh
textlint --rule @textlint-rule/google-periods README.md
```

## What this rule checks

- list punctuation heuristics (fragment vs full-sentence list items)
- trailing period ambiguity after URLs
- period placement heuristics with quotation marks and parentheses
- headings ending with terminal punctuation
- decimal numbers written with commas instead of periods
- figure captions requiring terminal punctuation
- table captions avoiding terminal punctuation

Heuristic checks are report-only and do not auto-fix.

## License

MIT © azu

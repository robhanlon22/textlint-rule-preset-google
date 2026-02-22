# @textlint-rule/textlint-rule-google-tense

See:

- [Present tense | Google Developer Documentation Style Guide | Google Developers](https://developers.google.com/style/tense)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @textlint-rule/textlint-rule-google-tense

## Usage

Via `.textlintrc` (recommended):

```json
{
  "rules": {
    "@textlint-rule/google-tense": true
  }
}
```

Via CLI:

```
textlint --rule @textlint-rule/google-tense README.md
```

## Notes

This rule reports present-tense guidance (`will`, `would`) in instructional and reference prose.

## License

MIT © azu

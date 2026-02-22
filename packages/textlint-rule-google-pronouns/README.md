# @textlint-rule/textlint-rule-google-pronouns

See:

- [Pronouns | Google Developer Documentation Style Guide | Google Developers](https://developers.google.com/style/pronouns)
- [Second person | Google Developer Documentation Style Guide | Google Developers](https://developers.google.com/style/person)

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @textlint-rule/textlint-rule-google-pronouns

## Usage

Via `.textlintrc` (recommended):

```json
{
  "rules": {
    "@textlint-rule/google-pronouns": true
  }
}
```

Via CLI:

```
textlint --rule @textlint-rule/google-pronouns README.md
```

## Notes

This rule reports gendered pronouns and first-person singular pronouns in prose. It does not provide autofixes.

## License

MIT © azu

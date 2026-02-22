# @textlint-rule/textlint-rule-google-active-voice

See [Active voice | Google Developer Documentation Style Guide | Google Developers](https://developers.google.com/style/voice).

## Install

Install with [npm](https://www.npmjs.com/):

    npm install @textlint-rule/textlint-rule-google-active-voice

## Usage

Via `.textlintrc` (recommended):

```json
{
  "rules": {
    "@textlint-rule/google-active-voice": true
  }
}
```

Via CLI:

```
textlint --rule @textlint-rule/google-active-voice README.md
```

## Notes

This rule reports likely passive voice patterns. It does not provide autofixes.

## License

MIT © azu

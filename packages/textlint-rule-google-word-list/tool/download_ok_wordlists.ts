// MIT © 2017 azu
/**
 * Download dont use word list
 * https://developers.google.com/style/word-list
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import client from "cheerio-httpcli";

interface WordEntry {
  word: string;
  message: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const toText = (html: string): string => {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const toDescription = (descriptionHtml: string): string => {
  // some work tag is broken
  // Google forget to close <dd>
  // search next <dt> or <dd>, trim
  const match = /(!?<dt |<dd>)/.exec(descriptionHtml);
  if (match?.index === undefined) {
    return toText(descriptionHtml).trim();
  }
  return toText(descriptionHtml.slice(0, match.index)).trim();
};

const main = async (): Promise<void> => {
  const document = await client.fetch(
    "https://developers.google.com/style/word-list",
  );
  const $ = document.$;
  const okWordList = $("dt:not(.dontuse)");
  const wordList: WordEntry[] = [];

  okWordList.each((_index, element) => {
    const nextDD = $(element).next();
    if (nextDD.is("dd")) {
      const descriptionHtml = nextDD.html();
      wordList.push({
        word: $(element).text().trim(),
        message:
          typeof descriptionHtml === "string"
            ? toDescription(descriptionHtml)
            : "",
      });
      return;
    }

    wordList.push({
      word: $(element).text().trim(),
      message: "",
    });
  });

  fs.writeFileSync(
    path.join(__dirname, "ok-word-list.json"),
    JSON.stringify(wordList, null, 4),
    "utf-8",
  );
};

void main();

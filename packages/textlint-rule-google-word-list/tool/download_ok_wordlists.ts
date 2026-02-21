// MIT © 2017 azu
/**
 * Download dont use word list
 * https://developers.google.com/style/word-list
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cheerio from "cheerio";
import client from "cheerio-httpcli";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toText = (html) => {
    const $ = cheerio.load(html);
    return $.text();
};
(async function main() {
    const document = await client.fetch("https://developers.google.com/style/word-list");
    const $ = document.$;
    const okWordList = $("dt:not(.dontuse)");
    const wordList = okWordList
        .map((index, element) => {
            const nextDD = $(element).next();
            if (nextDD.is("dd")) {
                const descriptionHtml = nextDD.html();
                // some work tag is broken
                // Google forget to close <dd>
                // search next <dt> or <dd>, trim
                const match = descriptionHtml.match(/(!?<dt |<dd>)/);
                // clean html tag
                if (!match) {
                    return {
                        word: $(element).text().trim(),
                        message: toText(descriptionHtml).trim(),
                    };
                }
                const description = descriptionHtml.slice(0, match.index);
                return {
                    word: $(element).text().trim(),
                    message: toText(description).trim(),
                };
            }
            return {
                word: $(element).text().trim(),
                message: "",
            };
        })
        .get();
    fs.writeFileSync(path.join(__dirname, "ok-word-list.json"), JSON.stringify(wordList, null, 4), "utf-8");
})();

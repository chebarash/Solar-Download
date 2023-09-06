import dotenv from "dotenv";
import { Api } from "figma-api";
import readline from "readline";
import https from "https";

import { IconsType, UrlsType } from "./types";

import progress from "./progress";
import Download from "./download";
import log from "./log";

dotenv.config();
const { TOKEN, FILE, HOSTNAME, BOT } = process.env;

if (!TOKEN || !FILE || !HOSTNAME || !BOT) {
  console.error(`Environment Variables not set`);
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on(`close`, () => process.exit(0));
const prompt = (query: string) =>
  new Promise((resolve) => rl.question(query, resolve));

const api = new Api({ personalAccessToken: TOKEN });
const chunkSize = 580;

(async () => {
  const icons: IconsType = {};
  const urls: UrlsType = {};

  console.log(`Get File`);

  const { components } = await api.getFile(FILE, { ids: [`0:1`] });
  const ids = Object.keys(components);

  console.log(`Get Image`);

  for (let i = 0; i < ids.length; i += chunkSize) {
    progress(ids.length, i + chunkSize);
    Object.assign(
      urls,
      (
        await api.getImage(FILE, {
          ids: ids.slice(i, i + chunkSize).join(`,`),
          format: `svg`,
          scale: 1,
        })
      ).images
    );
  }

  console.log(`Downloading`);

  const { getIcon } = new Download(urls);
  await Promise.all(
    ids.map(async (id) => {
      const [style, category, name]: Array<string> = components[id].name
        .split(` / `)
        .map((s) => s.replace(/  /, ` `).trim());
      if (!icons[category]) icons[category] = {};
      if (!icons[category][name]) icons[category][name] = {};
      return (icons[category][name][style] = await getIcon(urls[id]));
    })
  );

  log(icons);

  const result = await prompt(`Ok? [y,n] `);
  if (result != `y`) return rl.close();

  const req = https.request(
    {
      hostname: HOSTNAME,
      path: `/${BOT}`,
      method: `POST`,
      headers: {
        "Content-Type": `application/json`,
      },
    },
    (res) => {
      console.log(`Status: ` + res.statusCode);
      res.setEncoding(`utf8`);
      res.on(`data`, function (body) {
        console.log(`Body: ` + body);
        return rl.close();
      });
    }
  );
  req.on(`error`, function (e) {
    console.log(`problem with request: ` + e.message);
    return rl.close();
  });
  req.write(JSON.stringify(icons));
  req.end();
})();

import dotenv from "dotenv";
import { Api } from "figma-api";
import readline from "readline";
import { connect, disconnect } from "mongoose";
import { Schema, model } from "mongoose";

import { IconsType, UrlsType } from "./types";

import Download from "./download";
import log from "./log";

dotenv.config();
const { TOKEN, FILE, DB_CONNECTION_STRING } = process.env;

if (!TOKEN || !FILE || !DB_CONNECTION_STRING) {
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

const IconsSchema = new Schema<{ icons: IconsType }>({ icons: Object });
const Icons = model<{ icons: IconsType }>("Icons", IconsSchema);

(async () => {
  const icons: IconsType = {};

  console.log(`Get File`);

  const { components } = await api.getFile(FILE, { ids: [`0:1`] });
  const ids = Object.keys(components);

  console.log(`Downloading`);

  const { getIcon } = new Download(ids.length);

  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunkIds = ids.slice(i, i + chunkSize);
    const urls = (
      await api.getImage(FILE, {
        ids: chunkIds.join(`,`),
        format: `svg`,
        scale: 1,
      })
    ).images as UrlsType;
    await Promise.all(
      chunkIds.map(async (id) => {
        const [style, category, name]: Array<string> = components[id].name
          .split(` / `)
          .map((s) => s.replace(/  /, ` `).trim());
        if (!icons[category]) icons[category] = {};
        if (!icons[category][name]) icons[category][name] = {};
        return (icons[category][name][style] = (await getIcon(urls[id]))
          .replace(/\n/g, ``)
          .replace(
            `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">`,
            ``
          )
          .replace(`</svg>`, ``));
      })
    );
  }

  log(icons);

  const result = await prompt(`Ok? [y,n] `);
  if (result != `y`) return rl.close();

  await connect(DB_CONNECTION_STRING);

  await Icons.deleteMany({});
  await new Icons({ icons }).save();

  await disconnect();
  process.exit(0);
})();

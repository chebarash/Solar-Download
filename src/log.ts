import { IconsType } from "./types";

const log = (icons: IconsType) => {
  const catKeys = Object.keys(icons);
  const catValues = Object.values(icons);
  const catEntries = catValues.map((c) => Object.entries(c));
  const catFlat = catEntries.flat();

  console.log(`Categories:`, catKeys);
  console.log(`Categories number:`, catKeys.length);
  console.log(
    `Icons in categories number:`,
    catEntries.map((d) => d.length)
  );
  console.log(
    `Incorrect icons:`,
    catFlat
      .map(([a, b]) => [a, Object.keys(b)])
      .filter(([a, b]) => b.length !== 6)
  );
  const list: { [style: string]: number } = {};
  catFlat
    .map(([_, a]) => Object.keys(a))
    .flat()
    .forEach((a) => {
      if (!list[a]) list[a] = 0;
      list[a]++;
    });
  console.log(`Styles number:`, list);
};

export default log;

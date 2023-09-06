const progress = (total: number, stat: number) => {
  process.stderr.cursorTo(0);
  if (stat / total >= 1) return process.stderr.clearLine(0);
  const width = process.stderr.columns;
  const completeLength = Math.round(width * (stat / total));
  const complete = Array(Math.max(0, completeLength)).join(`\x1b[46m \x1b[0m`);
  const incomplete = Array(Math.max(0, width - completeLength)).join(
    `\x1b[47m \x1b[0m`
  );
  process.stderr.write(complete + incomplete);
  process.stderr.clearLine(1);
};

export default progress;

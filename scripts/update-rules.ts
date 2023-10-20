const SOURCE = "https://publicsuffix.org/list/effective_tld_names.dat";

function parseLine (line: string) {
  const trimmed = line.trim();

  // Ignore empty lines and comments.
  if (!trimmed || (trimmed.charAt(0) === "/" && trimmed.charAt(1) === "/")) {
    return;
  }

  // Only read up to first whitespace char.
  return trimmed.split(" ")[0];
}

const text = await fetch(SOURCE).then((res) => res.text());
const lines = text.split(/\n/);
const rules = lines.map(parseLine);

console.log(JSON.stringify(rules, null, 2));

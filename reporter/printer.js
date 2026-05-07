#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const inputFile = process.argv[2];
const outputFile = process.argv[3] || "report.md";

if (!inputFile) {
  console.error("Usage:");
  console.error("  node extract-lines.js input.txt output.md");
  process.exit(1);
}

function parseRanges(text) {
  return text
    .split(",")
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const [start, end] = part.split("-").map(n => parseInt(n.trim(), 10));

      if (Number.isNaN(start) || Number.isNaN(end)) {
        throw new Error(`Invalid range: ${part}`);
      }

      return { start, end };
    });
}

function extractLines(lines, start, end) {
  return lines
    .slice(start - 1, end)
    .map((line, i) => {
      const lineNumber = start + i;
      return `${String(lineNumber).padStart(4, " ")} | ${line}`;
    })
    .join("\n");
}

const input = fs.readFileSync(inputFile, "utf8");

const sections = [];

for (const rawLine of input.split(/\r?\n/)) {
  const line = rawLine.trim();

  if (!line || line.startsWith("#")) {
    continue;
  }

  const separatorIndex = line.indexOf(":");

  if (separatorIndex === -1) {
    console.warn(`Skipping invalid line: ${line}`);
    continue;
  }

  const filePath = line.slice(0, separatorIndex).trim();
  const rangesText = line.slice(separatorIndex + 1).trim();

  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    console.warn(`File not found: ${filePath}`);
    continue;
  }

  const fileContent = fs.readFileSync(absolutePath, "utf8");
  const lines = fileContent.split(/\r?\n/);

  const ranges = parseRanges(rangesText);

  sections.push(`# ${filePath}\n`);

  for (const range of ranges) {
    const snippet = extractLines(lines, range.start, range.end);

    sections.push(
`## Lines ${range.start}-${range.end}

\`\`\`js
${snippet}
\`\`\`
`
    );
  }
}

fs.writeFileSync(outputFile, sections.join("\n"), "utf8");

console.log(`Markdown report generated: ${outputFile}`);
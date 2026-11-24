import { readFileSync } from 'node:fs';

const file = 'skills/colosseum-copilot/SKILL.md';
const content = readFileSync(file, 'utf8');
const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content)?.[1] ?? '';
const versions = [
  ['frontmatter', [...frontmatter.matchAll(/^version: *(\d+\.\d+\.\d+) *$/gm)]],
  ['inline declaration', [...content.matchAll(/This skill is version \*\*(\d+\.\d+\.\d+)\*\*/g)]],
  ['inline comparison', [...content.matchAll(/semantically against `(\d+\.\d+\.\d+)`/g)]],
  ['request version', [...content.matchAll(/on every Copilot API request \(currently `(\d+\.\d+\.\d+)`\)/g)]],
];
const expected = versions[0][1][0]?.[1];
let failures = 0;
for (const [label, matches] of versions) {
  if (matches.length !== 1 || matches[0][1] !== expected) {
    console.error(`${file}: ${label} must appear once and match frontmatter version ${expected ?? '(missing)'}`);
    failures++;
  }
}

if (failures) {
  process.exitCode = 1;
} else {
  console.log(`Skill version check passed: ${expected}.`);
  console.log('The server version constant lives in a separate repository and is not checked here.');
}

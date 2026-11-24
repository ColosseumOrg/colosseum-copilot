import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const patterns = [
  /https?:\/\/(?:linear\.app|[^/\s]+\.(?:internal|local)|(?:[^/\s]+\.)?slack\.com)(?:[/:\s]|$)/i,
  /https?:\/\/[^\s/]+\/(?:threads|artifacts)\/|@[a-z]+_[\w-]+|\b(?!CAIP-\d+\b)[A-Z]{2,10}-\d+\b/,
  /\u2014/,
];
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter((file) => /\.(?:md|mdx|json|ya?ml)$/.test(file));

let failures = 0;
function check(label, content) {
  const match = patterns.map((pattern) => pattern.exec(content)).find(Boolean);
  if (!match) return;
  const line = content.slice(0, match.index).split('\n').length;
  console.error(`${label}:${line}: non-public content or prohibited punctuation found`);
  failures++;
}

for (const file of files) {
  let content = readFileSync(file, 'utf8');
  if (file === 'skills/colosseum-copilot/references/grid-recipes.md') {
    // Temporary for 2.2.0: fix the punctuation and remove this exception in the next 2.2.x release.
    // Match the entire existing line once; edits, duplicates, and new lines still fail.
    const skill = readFileSync('skills/colosseum-copilot/SKILL.md', 'utf8');
    if (/^version: 2\.2\.0$/m.test(skill)) {
      content = content.replace(
        /^- No full-text search \u2014 `_contains` and `_like` are case-insensitive substring matches$/m,
        '',
      );
    }
  }
  check(file, content);
}

if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
  const { pull_request: pr } = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  check('PR title', pr.title);
  check('PR body', pr.body ?? '');
  check('Branch', pr.head.ref);
  const commits = execFileSync('git', ['log', '--format=%B', `${pr.base.sha}..${pr.head.sha}`], {
    encoding: 'utf8',
  });
  check('Commit messages', commits);
}

if (failures) {
  process.exitCode = 1;
} else {
  console.log(`Public content check passed for ${files.length} tracked content files and available PR metadata.`);
}

const readline = require('readline/promises');

function parseArgs(argv) {
  const flags = { dryRun: false, json: false, csv: false, yes: false };
  const args = [];
  for (const item of argv) {
    if (item === '--dry-run') flags.dryRun = true;
    else if (item === '--json') flags.json = true;
    else if (item === '--csv') flags.csv = true;
    else if (item === '--yes') flags.yes = true;
    else args.push(item);
  }
  return { command: args.slice(0, 2).join(' '), args: args.slice(2), flags };
}

const destructive = new Set(['user suspend', 'course archive', 'enrollment remove', 'backup run', 'db migrate', 'rag reindex']);

async function confirm(command, flags) {
  if (flags.dryRun || flags.yes || !destructive.has(command)) return;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`Confirm ${command}? Type YES: `);
  rl.close();
  if (answer !== 'YES') throw new Error('Cancelled');
}

async function runCli(argv) {
  const apiUrl = process.env.CLIADM_API_URL;
  const token = process.env.CLIADM_ADMIN_TOKEN;
  if (!apiUrl || !token) throw new Error('CLIADM_API_URL and CLIADM_ADMIN_TOKEN are required');
  const parsed = parseArgs(argv);
  if (!parsed.command) throw new Error('Usage: cliadm <resource> <action> [args] [--dry-run] [--json] [--csv]');
  await confirm(parsed.command, parsed.flags);
  const response = await fetch(`${apiUrl}/api/cli/commands`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ command: parsed.command, args: parsed.args, dryRun: parsed.flags.dryRun, output: parsed.flags.csv ? 'csv' : 'json' }),
  });
  const text = await response.text();
  if (!response.ok) throw new Error(text);
  if (parsed.flags.json || parsed.flags.csv) console.log(text);
  else console.log(`OK: ${parsed.command}\n${text}`);
}

module.exports = { runCli };

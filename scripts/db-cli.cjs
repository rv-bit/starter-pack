#!/usr/bin/env node

// Cross-platform runner for drizzle-kit commands.
// Loads .env, then spawns drizzle-kit directly using process.env values —
// avoids shell $VAR expansion issues between bash/zsh and cmd/PowerShell.

const { spawnSync } = require("node:child_process");
const path = require("node:path");
const process = require("node:process");

require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const command = process.argv[2]; // e.g. "generate", "migrate", "push", "studio"

if (!command) {
	console.error("Usage: node scripts/db.js <generate|migrate|push|studio>");
	process.exit(1);
}

const configPath = process.env.DATABASE_SETTINGS;
if (!configPath) {
	console.error("DATABASE_SETTINGS is not set in .env");
	process.exit(1);
}

const args = ["drizzle-kit", command, `--config=${configPath}`];

if (command === "studio") {
	const port = process.env.DATABASE_CLI_PORT;
	if (port)
		args.push(`--port=${port}`);
}

const result = spawnSync("npx", args, {
	stdio: "inherit",
	env: process.env,
	shell: process.platform === "win32", // npx needs shell:true on Windows
});

process.exit(result.status ?? 1);

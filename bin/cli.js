#!/usr/bin/env node

const CLI = require('../components/cli-prompt.js');

const args = process.argv.slice(2);

let command = args[0] && args[0].toLowerCase();
let flags = (args.length > 1 ? args.slice(1) : []).map(flag => flag.toLowerCase());

try {
	require('../commands/' + command + '.js').execute(flags);
} catch (ex) {
	if (ex.message.indexOf("Cannot find module") === 0) {
		console.log("Usage: cfcabot <command> [flags]");
		console.log("  Available commands:");
		console.log("    - apikey: Set or update your Cloudflare CA API key");
		console.log("    - list: List all certificates known to this machine (all these certs will be renewed when you use \"renew\")");
		console.log("    - new: Interactively get a new certificate");
		console.log("    - renew: Non-interactively renew all certificates that need renewal");
		console.log("        Use --force flag to force renewal of all certificates regardless of whether renewal is needed");
		console.log("    - revoke: Interactively revoke a certificate");
	} else {
		throw ex;
	}
}

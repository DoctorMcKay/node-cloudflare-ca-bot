#!/usr/bin/env node

let program = require('commander');
exports.program = program;

program.version(require('../package.json').version, '-v, --version')
	.option('--config <path>', 'Set path to config json file. Defaults to $HOME/.cfcabot_config.json');

program.command('apikey [key]')
	.description('Set or update your Cloudflare CA API key')
	.action((key, options) => {
		require('../commands/apikey.js').execute(options, key);
	});

program.command('list')
	.description('List all certificates known to this machine (all these certs will be renewed when you use "renew")')
	.action((options) => {
		require('../commands/list.js').execute(options);
	});

program.command('new')
	.description('Interactively get a new certificate')
	.action((options) => {
		require('../commands/new.js').execute(options);
	});

program.command('renew')
	.description('Non-interactively renew all certificates that need renewal')
	.option('--force', 'Force renewal of all certificates regardless of whether renewal is needed')
	.action((options) => {
		require('../commands/renew.js').execute(options);
	});

program.command('revoke')
	.description('Interactively revoke a certificate')
	.action((options) => {
		require('../commands/revoke.js').execute(options);
	});

program.parse(process.argv);

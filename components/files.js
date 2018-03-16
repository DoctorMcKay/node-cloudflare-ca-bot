let g_ConfigPath = require('../bin/cli.js').program.config;
let g_StorageRoot = '/etc/cfcabot';
if (!g_ConfigPath) {
	if (!process.env.HOME) {
		throw new Error("--config option not specified and no HOME environment variable is set. One is required to use cfcabot.");
	} else {
		g_ConfigPath = process.env.HOME + '/.cfcabot_config.json';
	}
}

const FS = require('fs');

let g_Config = null;
let g_Metadata = null;

exports.getConfig = function() {
	if (g_Config) {
		return g_Config;
	}

	try {
		let file = FS.readFileSync(g_ConfigPath);
		g_Config = JSON.parse(file.toString('utf8'));
		if (g_Config.storageRoot) {
			g_StorageRoot = g_Config.storageRoot;
		}

		return g_Config;
	} catch (ex) {
		if (ex.code == 'ENOENT') {
			// file doesn't exist, which is fine
			g_Config = {};
			return g_Config;
		}

		// whoops, something bad happened
		throw ex;
	}
};

exports.saveConfig = function() {
	FS.writeFileSync(g_ConfigPath, JSON.stringify(exports.getConfig(), undefined, "\t"));
};

exports.getMetadata = function() {
	exports.getConfig(); // to make sure our storage path is up to date

	if (g_Metadata) {
		return g_Metadata;
	}

	try {
		let file = FS.readFileSync(g_StorageRoot + '/meta.json');
		g_Metadata = JSON.parse(file.toString('utf8'));
		return g_Metadata;
	} catch (ex) {
		if (ex.code == 'ENOENT') {
			// file doesn't exist, which is fine
			g_Metadata = {};
			return g_Metadata;
		}

		// whoops, something bad happened
		throw ex;
	}
};

exports.saveMetadata = function() {
	exports.getConfig(); // to make sure our storage path is up to date
	FS.writeFileSync(g_StorageRoot + '/meta.json', JSON.stringify(exports.getMetadata(), undefined, "\t"));
};

exports.getStorageRoot = function() {
	exports.getConfig();
	return g_StorageRoot;
};

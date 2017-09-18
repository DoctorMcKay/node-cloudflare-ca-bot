if (!process.env.HOME) {
	throw new Error("No HOME environment variable is set. This is required to use cfcabot.");
}

const CONFIG_PATH = process.env.HOME + '/.cfcabot_config.json';
const METADATA_PATH = '/etc/cfcabot/meta.json';

const FS = require('fs');

let g_Config = null;
let g_Metadata = null;

exports.getConfig = function() {
	if (g_Config) {
		return g_Config;
	}

	try {
		let file = FS.readFileSync(CONFIG_PATH);
		g_Config = JSON.parse(file.toString('utf8'));
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
	FS.writeFileSync(CONFIG_PATH, JSON.stringify(exports.getConfig(), undefined, "\t"));
};

exports.getMetadata = function() {
	if (g_Metadata) {
		return g_Metadata;
	}

	try {
		let file = FS.readFileSync(METADATA_PATH);
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
	FS.writeFileSync(METADATA_PATH, JSON.stringify(exports.getMetadata(), undefined, "\t"));
};

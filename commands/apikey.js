const CLI = require('../components/cli-prompt.js');
const Files = require('../components/files.js');

exports.execute = function(flags) {
	CLI.question("Cloudflare Origin CA Key: ", (key) => {
		let config = Files.getConfig();
		config.cloudflareApiKey = key;
		Files.saveConfig();

		console.log("API key saved");
	});
};

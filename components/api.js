const HTTPS = require('https');

const Files = require('./files.js');

exports.req = function(method, endpoint, data, callback) {
	let config = Files.getConfig();
	if (!config.cloudflareApiKey) {
		process.stderr.write("You must first configure your Cloudflare Origin CA API key using \"cfcabot apikey\"\n");
		process.exit(1);
	}

	if (method.toUpperCase() == "GET") {
		throw new Error("GET requests are not currently supported");
	}

	let body = JSON.stringify(data || {});

	let req = HTTPS.request({
		"method": method,
		"host": "api.cloudflare.com",
		"port": 443,
		"path": "/client/v4" + endpoint,
		"headers": {
			"X-Auth-User-Service-Key": config.cloudflareApiKey,
			"User-Agent": "node.js cfcabot/" + require('../package.json').version,
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(body)
		}
	}, (res) => {
		let data = "";
		res.on('data', chunk => data += chunk.toString('utf8'));
		res.on('end', () => {
			try {
				data = JSON.parse(data);
			} catch (ex) {
				callback(ex);
				return;
			}

			if (!data.success) {
				if (data.errors && data.errors[0] && data.errors[0].message) {
					callback(new Error(data.errors[0].message));
				} else if (res.statusCode != 200) {
					callback(new Error("HTTP error " + res.statusCode));
				} else {
					callback(new Error("Bad response from Cloudflare"));
				}

				return;
			}

			callback(null, data.result);
		});
	});

	req.end(body);
	req.on('error', callback);
};

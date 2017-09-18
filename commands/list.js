const Files = require('../components/files.js');

exports.execute = function(flags) {
	let meta = Files.getMetadata();
	if (!meta.certs || Object.keys(meta.certs).length == 0) {
		console.log("No certificates to list.");
		return;
	}

	console.log("Listing certificates:");
	console.log("======================================");
	for (let identity in meta.certs) {
		if (!meta.certs.hasOwnProperty(identity)) {
			continue;
		}

		console.log("Identity: " + identity);
		console.log("Hostnames: " + meta.certs[identity].hostnames.join(', '));
		console.log("Expires: " + (new Date(meta.certs[identity].expires_on)).toString());
		console.log("======================================");
	}
};

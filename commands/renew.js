const Files = require('../components/files.js');
const Provision = require('../components/provision.js');

const RENEW_THRESHOLD = 14; // renew when expiring in 14 days

exports.execute = function(flags) {
	let meta = Files.getMetadata();
	let force = flags.includes('--force');

	if (force) {
		console.log("Forcefully renewing all certificates...");
	} else {
		console.log("Renewing expired certificates...");
	}

	if (!meta.certs || Object.keys(meta.certs).length == 0) {
		console.log("No certificates to renew");
		return;
	}

	console.log("======================================");
	let now = new Date();
	let identities = Object.keys(meta.certs);
	attempt();

	function attempt() {
		if (identities.length == 0) {
			console.log("Finished");
			return;
		}

		let identity = identities.splice(0, 1)[0];
		let cert = meta.certs[identity];
		let expires = new Date(cert.expires_on);
		let days = Math.round((expires - now) / (1000 * 60 * 60 * 24));

		if (days < RENEW_THRESHOLD || force) {
			console.log("Renewing " + identity + "; expires in " + days + " days");
			Provision.provision(cert.hostnamesOrdered, (err) => {
				if (err) {
					process.stderr.write("Cannot renew " + identity + ": " + err.message + "\n");
				} else {
					console.log("Successfully renewed " + identity);
				}

				console.log("======================================");
				attempt();
			});
		} else {
			console.log("Certificate for " + identity + " expires in " + days + " days; doesn't need to be renewed yet");
			console.log("======================================");
			attempt();
		}
	}
};

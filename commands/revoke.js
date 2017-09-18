const API = require('../components/api.js');
const CLI = require('../components/cli-prompt.js');
const Files = require('../components/files.js');

exports.execute = function(flags) {
	let meta = Files.getMetadata();

	let identities = [];
	if (meta.certs) {
		identities = identities.concat(Object.keys(meta.certs));
	}

	if (meta.history) {
		identities = identities.concat(Object.keys(meta.history).filter((identity) => {
			for (let timestamp in meta.history[identity]) {
				if (!meta.history[identity].hasOwnProperty(timestamp)) {
					continue;
				}

				if (!isExpired(meta.history[identity][timestamp]) && !meta.history[identity][timestamp].revoked) {
					return true; // we need to revoke this
				}
			}

			return false;
		}));
	}

	identities = identities.filter((item, pos) => identities.indexOf(item) == pos); // remove dupes

	if (identities.length == 0) {
		console.log("No certificates to revoke");
		return;
	}

	console.log("Warning: If you have Full (strict) SSL mode enabled in Cloudflare, this WILL BREAK your origin until you provision a new certificate!");
	console.log("Once revoked, the certificate will not renew itself! You will need to go through the \"cfcabot new\" process again.");
	CLI.choice("Which certificate would you like to revoke?", identities, (identity) => {
		console.log("Are you sure you want to revoke the certificate with identity " + identity + "?");

		if (meta.certs[identity]) {
			console.log("It covers these hosts: " + meta.certs[identity].hostnames.join(', '));
		}

		CLI.confirm("Revoke certificate?", (revoke) => {
			if (revoke) {
				checkForRevoke(identity);
			} else {
				console.log("Canceled.");
			}
		});
	});
};

function checkForRevoke(identity) {
	let meta = Files.getMetadata();
	let now = new Date();

	meta.history = meta.history || {};
	meta.history[identity] = meta.history[identity] || {};

	if (meta.certs && meta.certs[identity]) {
		let cert = meta.certs[identity];
		if (isExpired(cert)) {
			// it's expired already
			console.log("Active certificate for " + identity + " is already expired, so no need to revoke");
			cert.revoked = true;
			meta.history[identity][cert.timestamp] = cert;
			delete meta.certs[identity];
			checkForRevoke(identity);
		} else {
			revoke(cert, (err) => {
				if (err) {
					finalize();
					return;
				}

				cert.revoked = true;
				meta.history[identity][cert.timestamp] = cert;
				delete meta.certs[identity];
				checkForRevoke(identity);
			});
		}
	} else {
		let history = Object.keys(meta.history[identity]).filter((timestamp) => {
			let cert = meta.history[identity][timestamp];
			if (cert.revoked) {
				return false;
			}

			if (isExpired(cert)) {
				// already expired, so no need to do anything
				return false;
			}

			return true; // good revocation candidate
		});

		if (history.length == 0) {
			// nothing to revoke
			finalize();
			return;
		}

		let cert = meta.history[identity][history[0]];
		revoke(cert, (err) => {
			if (err) {
				finalize();
				return;
			}

			cert.revoked = true;
			checkForRevoke(identity);
		});
	}
}

function finalize() {
	Files.saveMetadata();
	console.log("All applicable certificates have been revoked successfully.");
}

function revoke(cert, callback) {
	console.log("Revoking certificate " + cert.id + " (expires " + (new Date(cert.expires_on)).toString() + ")");
	API.req('DELETE', '/certificates/' + cert.id, {}, (err, result) => {
		if (err) {
			process.stderr.write("Cannot revoke certificate " + cert.id + ": " + err.message + "\n");
		} else {
			console.log("Certificate revoked!");
		}

		callback(err);
	});
}

function isExpired(cert) {
	return new Date(cert.expires_on) < Date.now();
}

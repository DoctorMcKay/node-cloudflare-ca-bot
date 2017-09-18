const CLI = require('../components/cli-prompt.js');
const Files = require('../components/files.js');
const Provision = require('../components/provision.js');

exports.execute = function(flags) {
	let meta = Files.getMetadata();
	console.log("Please enter the domain(s) you want to cover with this certificate, separated by commas");
	console.log("They must be domains you've verified in Cloudflare already (or subdomains of those domains). Wildcards supported.");
	console.log("The first domain in the list will be the identity of this certificate. It will be how you refer to it.");

	CLI.question("Domains: ", (domains) => {
		domains = domains.split(',').map(domain => domain.toLowerCase().trim());
		if (meta && meta.certs && meta.certs[domains[0]]) {
			process.stderr.write("Cannot provision new certificate for this set of domains: there is already a cert with identity " + domains[0] + "\n");
			process.exit(2);
		}

		Provision.provision(domains, (err, timestamp, privKeyPath, csrPath, certPath) => {
			if (err) {
				process.stderr.write("Cannot create certificate: " + err.message + "\n");
				process.exit(3);
			}

			console.log("Certificate created successfully! It will renew automatically when you run the \"cfcabot renew\" command.");
			console.log("  Private key: " + privKeyPath);
			console.log("  CSR: " + csrPath);
			console.log("  Certificate: " + certPath);
		});
	});
};

const exec = require('child_process').execFileSync;
const FS = require('fs');

const API = require('./api.js');
const Files = require('./files.js');

const DATA_BASE_PATH = '/etc/cfcabot';
const KEY_PATH = DATA_BASE_PATH + '/private';
const CSR_PATH = DATA_BASE_PATH + '/csr';
const CERT_PATH = DATA_BASE_PATH + '/cert';
const VALIDITY_DAYS = 90;

exports.provision = function(domains, callback) {
	let identity = domains[0];
	let now = Date.now();

	mkdir(KEY_PATH + '/' + identity);
	mkdir(CSR_PATH + '/' + identity);
	mkdir(CERT_PATH + '/' + identity);

	let archiveKeyPath = KEY_PATH + '/' + identity + '/' + now + '.pem';
	let archiveCsrPath = CSR_PATH + '/' + identity + '/' + now + '.csr';
	let archiveCertPath = CERT_PATH + '/' + identity + '/' + now + '.pem';

	// Generate private key and CSR
	console.log("Generating private key and CSR...");

	exec('openssl', [
		'req',
		'-nodes',
		'-days', VALIDITY_DAYS,
		'-newkey', 'rsa:2048',
		'-subj', '/C=US/ST=Denial/L=Springfield/O=Dis/CN=' + identity,
		'-keyout', archiveKeyPath,
		'-out', archiveCsrPath
	], {"stdio": ['pipe', null, 'pipe']});

	let csr = FS.readFileSync(archiveCsrPath).toString('utf8');
	console.log("Requesting certificate from Cloudflare API...");

	API.req('POST', '/certificates', {
		"hostnames": domains,
		"requested_validity": VALIDITY_DAYS,
		"request_type": "origin-rsa",
		"csr": csr
	}, (err, result) => {
		if (err) {
			cleanup();
			callback(err);
			return;
		}

		if (!result.id || !result.certificate || !result.expires_on) {
			cleanup();
			callback(new Error("Malformed response from Cloudflare"));
			return;
		}

		console.log("Provisioned certificate successfully, with ID " + result.id + " (expires " + result.expires_on + ")");
		FS.writeFileSync(archiveCertPath, result.certificate);

		// save the data in metadata
		let meta = Files.getMetadata();
		meta.certs = meta.certs || {};
		meta.history = meta.history || {};
		
		if (meta.certs[identity]) {
			let cert = meta.certs[identity];
			meta.history[identity] = meta.history[identity] || {};
			meta.history[identity][cert.timestamp] = cert;
		}
		
		meta.certs[identity] = {
			"id": result.id,
			"timestamp": now,
			"hostnames": result.hostnames,
			"hostnamesOrdered": domains,
			"expires_on": result.expires_on,
			"request_type": result.request_type,
			"requested_validity": result.requested_validity
		};

		let keyPath = KEY_PATH + '/' + identity + '/privkey.pem';
		let csrPath = CSR_PATH + '/' + identity + '/request.csr';
		let certPath = CERT_PATH + '/' + identity + '/cert.pem';

		unlink(keyPath);
		unlink(csrPath);
		unlink(certPath);
		FS.symlinkSync(archiveKeyPath, keyPath);
		FS.symlinkSync(archiveCsrPath, csrPath);
		FS.symlinkSync(archiveCertPath, certPath);

		Files.saveMetadata();
		callback(null, now, keyPath, csrPath, certPath);
	});

	function cleanup() {
		unlink(archiveKeyPath);
		unlink(archiveCsrPath);
	}
};

function unlink(path) {
	try {
		FS.unlinkSync(path);
		return true;
	} catch (ex) {
		if (ex.code == 'ENOENT') {
			return true;
		}

		throw ex;
	}
}

function mkdir(path) {
	try {
		FS.mkdirSync(path);
		return true;
	} catch (ex) {
		if (ex.code == 'EEXIST') {
			return true;
		}

		throw ex;
	}
}

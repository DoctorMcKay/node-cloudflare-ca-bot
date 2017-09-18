const FS = require('fs');

const dirs = [
	'/etc/cfcabot',
	'/etc/cfcabot/private',
	'/etc/cfcabot/csr',
	'/etc/cfcabot/cert'
];

if (dirs.every(FS.existsSync.bind(FS))) {
	// they all exist, it's fine
	process.exit(0);
}

// we need to create directories
dirs.forEach(mkdir);

function mkdir(path) {
	try {
		FS.mkdirSync(path, 0o777);
	} catch (ex) {
		if (ex.code == 'EEXIST') {
			// it's okay if it already exists
			return;
		}

		if (ex.code == 'EACCES') {
			process.stderr.write("Could not create directory " + path + "; did you use the \"--unsafe-perm true\" flag?\n");
			process.exit(1);
		}
	}
}

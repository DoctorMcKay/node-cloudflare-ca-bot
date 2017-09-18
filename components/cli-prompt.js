const ReadLine = require('readline');
const rl = ReadLine.createInterface(process.stdin, process.stdout);

rl.pause();

exports.question = function(prompt, callback) {
	rl.question(prompt, (response) => {
		rl.pause();
		callback(response);
	});
};

exports.choice = function(prompt, choices, callback) {
	if (choices.length == 0) {
		throw new Error("No choices in choice prompt");
	}

	console.log("=============================");
	console.log(prompt);
	choices.forEach((choice, idx) => console.log("  " + (idx + 1) + ". " + choice));
	console.log("=============================");

	doPrompt();
	function doPrompt() {
		exports.question("Enter choice [1-" + choices.length + "]: ", (response) => {
			let num = parseInt(response, 10);
			if (isNaN(num) || num < 1 || num > choices.length) {
				console.log("Bad selection");
				doPrompt();
				return;
			}

			callback(choices[num - 1]);
		});
	}
};

exports.confirm = function(prompt, callback) {
	exports.question(prompt + " [y/N]: ", (response) => {
		response = response.toLowerCase();
		switch (response) {
			case 'y':
				callback(true);
				break;

			case 'n':
				callback(false);
				break;

			default:
				exports.confirm(prompt, callback); // try again
		}
	});
};

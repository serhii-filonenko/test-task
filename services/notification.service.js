import chalk from 'chalk';

class Notification {
	success(message) {
		console.log(chalk.blueBright(message));
	}

	error(error) {
		console.log(chalk.redBright(error));
	}
}

export { Notification };

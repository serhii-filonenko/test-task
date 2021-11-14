import chalk from 'chalk';

class Notification {
	success(text = '') {
		const textMessage = text || 'Connection success';

		console.log(chalk.blueBright(textMessage));
	}

	error(error) {
		console.log(chalk.redBright(error));
	}
}

export { Notification };

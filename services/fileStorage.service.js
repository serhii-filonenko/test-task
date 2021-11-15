import fs from 'fs';

class FileStorage {
	constructor({ notification }) {
		this.notificationService = notification;
	}
	async save(data) {
		fs.writeFile(
			__dirname + '/../result/result.json',
			JSON.stringify(data),
			(err) => {
				if (err) {
					this.notificationService.error(err);
				} else {
					this.notificationService.success('Schema is saved');
				}
			})
	}
}

export { FileStorage };

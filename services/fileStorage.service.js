import fs from 'fs';
import GenerateSchema from 'generate-schema';

class FileStorage {
	constructor({ notification }) {
		this.notificationService = notification;
	}
	async save(data) {
		fs.writeFile(
			__dirname + '/../result/result.json',
			JSON.stringify(this.generateSchema(data)),
			(err) => {
				if (err) {
					this.notificationService.error(err);
				} else {
					this.notificationService.success('Schema is saved');
				}
			})
	}

	generateSchema(data) {
		return Array.from(data.entries())
			.map(([key, value]) => GenerateSchema.json(key, value));
	}
}

export { FileStorage };

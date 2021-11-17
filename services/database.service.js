import cassandra from 'cassandra-driver';
import { Database as DatabaseRepository } from '../repositories';
import { Converter as ConverterService } from './converter.service';

class Database {
	constructor({ notification, fileStorage, config }) {
		this.notificationService = notification;
		this.fileStorage = fileStorage;
		this.config = config;
		this.client = this._connect(this.config);
		this.databaseRepository = new DatabaseRepository({ client: this.client });
		this.converterService = new ConverterService({
			databaseRepository: this.databaseRepository
		});
	}

	_connect(config) {
		let client;

		try {
			const contactPoints = [`${config.host}:${config.port}`];
			const authProvider = new cassandra.auth.PlainTextAuthProvider(
				config.user,
				config.password,
			);

			client = new cassandra.Client({
				contactPoints,
				authProvider,
				localDataCenter: config.localDataCenter,
				keyspace: config.keyspace,
			});

			this.notificationService.success('Connection success');
		} catch (err) {
			this.notificationService.error(err);
		}

		return client;
	}

	async getSchema() {
		try {
			const tableColumns = await this.databaseRepository
				.getAllTablesColumnsByKeyspace(this.config.keyspace);

			const data = await this.converterService.databaseSchemaToJSONSchema(tableColumns);

			await this.fileStorage.save(data);
			await this.client.shutdown();
		} catch (err) {
			this.notificationService.error(err);
		}
	}
}

export { Database };

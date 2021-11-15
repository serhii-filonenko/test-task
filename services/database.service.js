import cassandra from 'cassandra-driver';
import { nativeTypes, typeCode } from '../constants';
import { Database as DatabaseRepository } from '../repositories';
import { getTypeFromCode } from '../helpers';

class Database {
	constructor({ notification, fileStorage, config }) {
		this.notificationService = notification;
		this.fileStorage = fileStorage;
		this.config = config;
		this.client = this._connect(this.config);
		this.databaseRepository = new DatabaseRepository({ client: this.client });
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

			this.notificationService.success();
		} catch (err) {
			this.notificationService.error(err);
		}

		return client;
	}

	async getSchema() {
		try {
			const tableColumns = await this.databaseRepository
				.getAllTablesColumnsByKeyspace(this.config.keyspace);

			const tables = new Map();

			await Promise.all(
				tableColumns.rows.map(async (row) => {
					let rowType = {
						type: getTypeFromCode(typeCode[row.type]),
					};
					let properties = null;

					if (!nativeTypes.includes(typeCode[row.type])) {
						const data = await this.databaseRepository
							.getColumnFromTable(row.column_name, row.table_name, 1);

						const { code, type: { info } } = data.columns[0];

						if (!Array.isArray(info)) {
							properties = info.fields.map(field => ({
								[field.name]: {
									type: getTypeFromCode(field.type.code),
								}
							}));

							properties = Object.assign(...properties);
						} else {
							properties = info.map(field => ({
								type: getTypeFromCode(field.code),
							}));
						}

						rowType = {
							type: getTypeFromCode(code) || 'object',
							properties: properties
						};
					} 

					if (tables.has(row.table_name)) {
						tables.set(row.table_name, {
							...tables.get(row.table_name),
							[row.column_name]: rowType,
						})
					} else {
						tables.set(row.table_name, {
							[row.column_name]: rowType,
						})
					}
				}));

			const data = Array.from(tables.entries())
				.map(([title, properties]) => ({
					"$schema": "http://json-schema.org/draft-04/schema#",
					title,
					properties,
				}));

			await this.fileStorage.save(data);

			await this.client.shutdown();
		} catch (err) {
			this.notificationService.error(err);
		}
	}
}

export { Database };

import cassandra from 'cassandra-driver';
import { nativeTypes, typeCode } from '../constants';

class Database {
	constructor({ notification, fileStorage, config }) {
		this.notificationService = notification;
		this.fileStorage = fileStorage;
		this.config = config;
		this.client = this._connect(this.config);
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
			const tableColumns = await this.client.execute(
				`
				SELECT * FROM system_schema.columns
				WHERE keyspace_name =?
				`,
				[this.config.keyspace]
			);

			const tables = new Map();

			await Promise.all(
				tableColumns.rows.map(async (row) => {
					let rowType = row.type;
					let properties = null;

					if (!nativeTypes.includes(typeCode[row.type])) {
						const data = await this.client.execute(
							`
								SELECT ${row.column_name} FROM ${row.table_name}
								LIMIT 1
							`
						);
						const { code, type: { info } } = data.columns[0];

						if (!Array.isArray(info)) {
							properties = info.fields.map(field => ({
								[field.name]: {
									type: Object.keys(typeCode).find(
										key => typeCode[key] === field.type.code
									),
								}
							}));

							properties = Object.assign(...properties);
						} else {
							properties = info.map(field => ({
								type: Object.keys(typeCode).find(
									key => typeCode[key] === field.code
								),
							}));
						}

						rowType = {
							type: Object.keys(typeCode).find(
								key => typeCode[key] === code
							) || 'object',
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


		} catch (err) {
			this.notificationService.error(err);
		}
	}
}

export { Database };

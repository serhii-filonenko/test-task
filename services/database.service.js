import cassandra from 'cassandra-driver';
import { notification } from './index';
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

					if (!nativeTypes.includes(typeCode[row.type])) {
						const data = await this.client.execute(
							`
								SELECT ${row.column_name} FROM ${row.table_name}
								LIMIT 1
							`
						);
						const { info } = data.columns[0].type;

						const propperties = info.fields.map(field => ({
							[field.name]: Object.keys(typeCode).find(
								key => typeCode[key] === field.type.code
							),

						}));

						rowType = Object.assign(...propperties);

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

			await this.fileStorage.save(tables);


		} catch (err) {
			this.notificationService.error(err);
		}
	}
}

export { Database };

class Database {
	constructor({ client }) {
		this.client = client;
	}

	getAllTablesColumnsByKeyspace(keyspace) {
		return this.client.execute(
			`
			SELECT * FROM system_schema.columns
			WHERE keyspace_name =?
			`,
			[keyspace]
		);
	}

	getColumnFromTable(column, table, limit) {
		return this.client.execute(
			`
				SELECT ${column} FROM ${table}
				LIMIT ${limit}
			`,
		);
	}
}

export { Database };
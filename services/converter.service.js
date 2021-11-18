import { getTypeFromCode } from '../helpers';
import { nativeTypes, typeCode } from '../constants';

class Converter {

	constructor({ databaseRepository }) {
		this.databaseRepository = databaseRepository;
	}

	async databaseSchemaToJSONSchema(tableColumns) {

		const tables = await this.mapTableColumns(tableColumns);

		const data = Array.from(tables.entries())
			.map(([title, properties]) => ({
				"$schema": "http://json-schema.org/draft-04/schema#",
				title,
				properties,
			}));

		return JSON.stringify(data);
	}

	async mapTableColumns(tableColumns) {
		const rows = tableColumns && tableColumns.rows || [];
		const tables = new Map();

		await Promise.all(
			rows.map(async (row) => {

				let type = getTypeFromCode(typeCode[row.type]);
				let properties = null;

				if (!nativeTypes.includes(typeCode[row.type])) {
					const data = await this.databaseRepository
						.getColumnFromTable(row.column_name, row.table_name, 1);

					const { type: columnType } = data.columns[0];
					const { code, info } = columnType;

					if (Array.isArray(info)) {
						type = getTypeFromCode(code) || 'array';
						properties = info.map(field => ({ type: getTypeFromCode(field.code) }));
					} else {
						properties = info.fields.map(field => ({
							[field.name]: { type: getTypeFromCode(field.type.code) }
						}));

						type = getTypeFromCode(code) || 'object';
						properties = Object.assign(...properties);
					}
				}

				const rowType = { type };

				if (properties) {
					rowType.properties = properties;
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

		return tables;
	}
}

export { Converter };

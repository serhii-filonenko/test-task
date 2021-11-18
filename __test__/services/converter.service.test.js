import { Converter as ConverterService } from "../../services/converter.service";

describe('tests for ConverterService', () => {
	let converterService;
	const mockRepository = jest.fn();
	const mockShema = [{ title: 'title', properties: 'properties' }];

	beforeEach(() => {
		converterService = new ConverterService({ databaseRepository: mockRepository });
	});

	it('When map tables', async () => {
		const mockmapTableColumns = jest.spyOn(ConverterService.prototype, 'mapTableColumns')

		const data = await converterService.mapTableColumns([]);

		expect(mockmapTableColumns).toHaveBeenCalledWith([]);
		expect(data).toBeDefined();
	});

		it('When return schema', async () => {
			const mockToSchema = jest.spyOn(ConverterService.prototype, 'databaseSchemaToJSONSchema')
			const data = await converterService.databaseSchemaToJSONSchema();

			expect(mockToSchema).toHaveBeenCalledTimes(1);
			expect(data).toEqual(JSON.stringify([]));
		});
});

import { Converter as ConverterService } from "../../services/converter.service";

jest.mock('../../services/converter.service');

describe('tests for ConverterService', () => {

	const mockRepository = jest.fn();

	beforeEach(() => {
		ConverterService.mockClear();
		ConverterService.mockImplementation(() => ({
				databaseRepository: mockRepository,
				databaseSchemaToJSONSchema: () => [],
			}));
	});

	it('When init constructor', () => {
		const converterService = new ConverterService();
		const repository = Symbol();

		converterService.databaseRepository(repository);

		expect(mockRepository).toHaveBeenCalledTimes(1);
		expect(mockRepository.mock.calls[0][0]).toBe(repository);
	})

	it('When create schema return data', async () => {
		const converterService = new ConverterService();
		const spy = jest.spyOn(converterService, 'databaseSchemaToJSONSchema');
		const data = await converterService.databaseSchemaToJSONSchema();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(data).toBeDefined();
		expect(data).toEqual([]);
	});
});

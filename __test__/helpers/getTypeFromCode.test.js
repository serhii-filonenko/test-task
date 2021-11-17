
import { getTypeFromCode } from '../../helpers';

describe('tests for getTypeFrom Code', () => {

	it('When code is not type', () => {

		expect(getTypeFromCode('notType')).toBeUndefined();
	});

	it('When code type is number', () => {

		expect(getTypeFromCode(9)).toEqual('number');
	});

	it('When code type is string', () => {

		expect(getTypeFromCode(10)).toEqual('string');
	});
});

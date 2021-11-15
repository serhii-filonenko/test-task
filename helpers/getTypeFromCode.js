import { typeCode } from "../constants"

const getTypeFromCode = (code) => {
	let type = null;

	switch (code) {
		case typeCode['ascii']:
		case typeCode['text']:
		case typeCode['varchar']:
			type = 'string';
			break;
		case typeCode['double']:
		case typeCode['float']:
		case typeCode['int']:
		case typeCode['smallint']:
		case typeCode['tinyint']:
			type = 'number';
			break;
		default:
			type = Object.keys(typeCode).find(
				key => typeCode[key] === code
			);
	}

	return type;
};

export { getTypeFromCode };

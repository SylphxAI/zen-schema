// Utils exports

export {
	config,
	deleteGlobalConfig,
	deleteGlobalMessage,
	deleteSchemaMessage,
	deleteSpecificMessage,
	getGlobalConfig,
	getGlobalMessage,
	getSchemaMessage,
	getSpecificMessage,
	setGlobalConfig,
	setGlobalMessage,
	setSchemaMessage,
	setSpecificMessage,
} from './config'
export {
	entriesFromList,
	entriesFromObjects,
	getDotPath,
	isOfKind,
	isOfType,
	isValiError,
	ValiError,
} from './error'
export { assert, is, parser, safeParse, safeParser, tryParse } from './safeParse'

import { FileLogger } from './FileLogger';
import { ProcessLogger } from './ProcessLogger';

type ConsoleProps = Pick<
	Console,
	| 'assert'
	| 'count'
	| 'countReset'
	| 'debug'
	| 'error'
	| 'info'
	| 'table'
	| 'time'
	| 'timeEnd'
	| 'timeLog'
	| 'trace'
	| 'warn'
>;

let processLogger = ProcessLogger.getInstance();

let fileLogger = FileLogger.getInstance();
let props: (keyof ConsoleProps)[] = [
	'assert',
	'count',
	'countReset',
	'debug',
	'error',
	'info',
	'table',
	'time',
	'timeEnd',
	'timeLog',
	'trace',
	'warn',
];
let combined = {} as ConsoleProps;

props.forEach(prop => {
	let isErr = prop === 'error' || prop === 'warn' || prop === 'trace';

	combined[prop] = (...a: [unknown, ...unknown[]]): void => {
		console[prop](...a);
		processLogger.writeTime(isErr);
		processLogger[prop](...a);
		fileLogger.updateFileStreams();
		fileLogger.writeTime(isErr);
		fileLogger[prop](...a);
	};
});

export const Logger = combined;

export function enableGlobalErrorCatching(): void {
	process.on('uncaughtException', err => Logger.error(err));
	process.on('unhandledRejection', err => Logger.error(err));
	process.on('warning', err => Logger.warn(err));
}

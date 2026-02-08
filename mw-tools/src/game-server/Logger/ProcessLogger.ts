import { Console } from 'console';
import { bold, grey, red, reset, yellow } from 'kleur/colors';
import type { Writable } from 'stream';

export class ProcessLogger extends Console {
	private static instance: ProcessLogger = new ProcessLogger();

	private constructor(
		private outStream: Writable = process.stdout,
		private errStream: Writable = process.stderr,
	) {
		super(outStream, errStream);
	}

	public static getInstance(): ProcessLogger {
		if (this.instance === null) this.instance = new ProcessLogger();

		return this.instance;
	}

	/**
	 * Print a debug message to the console.
	 * @param message
	 * @param optionalParams
	 */
	public override debug(message?: unknown, ...optionalParams: unknown[]): void {
		message = this.format(message);
		optionalParams = optionalParams.map(p => this.format(p));
		super.debug(message, ...optionalParams);
	}

	/**
	 * Print a message to the console.
	 * @param message
	 * @param optionalParams
	 */
	public override info(message?: unknown, ...optionalParams: unknown[]): void {
		message = this.format(message);
		optionalParams = optionalParams.map(p => this.format(p));
		super.info(message, ...optionalParams);
	}

	/**
	 * Print a warning to the console.
	 * @param message
	 * @param optionalParams
	 */
	public override warn(message?: unknown, ...optionalParams: unknown[]): void {
		message = this.format(message, true);
		optionalParams = optionalParams.map(p => this.format(p, true));

		if (typeof message === 'string') message = yellow(message);

		super.warn(message, ...optionalParams);
	}

	/**
	 * Print an error to the console.
	 * @param message
	 * @param optionalParams
	 */
	public override error(message?: unknown, ...optionalParams: unknown[]): void {
		message = this.format(message);
		optionalParams = optionalParams.map(p => this.format(p));

		if (typeof message === 'string') message = red(message);

		super.error(message, ...optionalParams);
	}

	/**
	 * Writes the time and date to the stream.
	 * @param toError
	 */
	public writeTime(toError: boolean = false): void {
		let stream = toError ? this.errStream : this.outStream;
		stream.write(grey(`[${new Date().toISOString()}] `));
	}

	/**
	 * Formats some types to look nicer.
	 * @param value
	 */
	private format<T>(value: T | string, asWarning: boolean = false): T | string {
		if (value instanceof Error) value = this.formatError(value, asWarning);
		else if (value instanceof Buffer) value = this.formatBuffer(value);

		return value;
	}

	/**
	 * Format a buffer.
	 * @param buffer
	 */
	private formatBuffer(buffer: Buffer): string {
		let arr = Array.from(buffer);
		let lines: string[] = [];

		for (let i = 0, l = buffer.length / 16; i < l; ++i) {
			lines.push(
				arr
					.slice(i * 16, (i + 1) * 16)
					.map(n => n.toString(16).toUpperCase().padStart(2, '0'))
					.join(' '),
			);
		}

		return '\n' + lines.join('\n');
	}

	/**
	 * Format an error message.
	 * @param error
	 */
	private formatError(error: Error, asWarning: boolean = false): string {
		let lines = (error.stack ?? '').split('\n');
		lines.shift();

		let first = lines.shift();
		let str = (asWarning ? yellow : red)(bold(error.name + ': ') + error.message);

		if (first) str += '\n' + reset(first);

		if (lines.length) str += '\n' + grey(lines.join('\n'));

		return str;
	}
}

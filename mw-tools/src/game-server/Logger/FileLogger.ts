import { Console } from 'console';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import type { Writable } from 'stream';
import { PassThrough } from 'stream';

export class FileLogger extends Console {
	private static instance: FileLogger | null = null;
	private outStream: PassThrough;
	private errStream: PassThrough;
	private fileOutStream: Writable | null;
	private fileErrStream: Writable | null;
	private logDir: string;
	private dateStr: string;

	public constructor() {
		let outStream = new PassThrough();
		let errStream = new PassThrough();
		super(outStream, errStream);

		this.outStream = outStream;
		this.errStream = errStream;
		this.fileOutStream = null;
		this.fileErrStream = null;
		this.logDir = module.path + '/../Logs';
		this.dateStr = '';

		if (!existsSync(this.logDir)) mkdirSync(this.logDir, { recursive: true });

		this.updateFileStreams();
	}

	public static getInstance(): FileLogger {
		if (this.instance === null) this.instance = new FileLogger();

		return this.instance;
	}

	/**
	 * Writes the time and date to the stream.
	 * @param toError
	 */
	public writeTime(toError: boolean = false): void {
		let stream = toError ? this.errStream : this.outStream;
		stream.write(`[${new Date().toISOString()}] `);
	}

	/**
	 * Update to which file the logger should write to.
	 */
	public updateFileStreams(): void {
		let dateStr = this.getDateString();

		if (dateStr === this.dateStr) return;

		this.dateStr = dateStr;

		if (this.fileOutStream !== null) {
			this.outStream.unpipe(this.fileOutStream);
			this.fileOutStream.end();
		}

		if (this.fileErrStream !== null) {
			this.errStream.unpipe(this.fileErrStream);
			this.fileErrStream.end();
		}

		this.fileOutStream = createWriteStream(`${this.logDir}/log_${dateStr}.log`, { flags: 'a' });
		this.fileErrStream = createWriteStream(`${this.logDir}/err_${dateStr}.log`, { flags: 'a' });

		this.outStream.pipe(this.fileOutStream);
		this.errStream.pipe(this.fileErrStream);
	}

	/**
	 * Returns the current date as string.
	 */
	private getDateString(): string {
		return new Date().toISOString().substring(0, 10);
	}
}

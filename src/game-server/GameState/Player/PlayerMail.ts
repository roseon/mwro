import { Logger } from '../../Logger/Logger';

export class MailItem {
	constructor(
		public mailAuthorID: number = 0,
		public mailMessage: string = '',
		public mailAuthorName: string = '',
		public mailID: number = 0,
		public mailTimestamp: number = 0,
	) {}
}

export class PendingMail {
	private static readonly maxMails = 15;
	public mailCount: number = 0;
	private mailItems: MailItem[] = [];

	public addMail(mail: MailItem): boolean {
		if (this.mailCount >= PendingMail.maxMails) {
			Logger.info(`Mail rejected: Player has reached mail limit of ${PendingMail.maxMails}`);
			return false;
		}
		this.mailCount++;
		this.mailItems.push(mail);
		return true;
	}

	public getMails(): MailItem[] {
		if (this.mailCount !== this.mailItems.length) {
			Logger.info('Mail count mismatch, fixing...');
			this.mailCount = this.mailItems.length;
		}
		return this.mailItems;
	}

	public getMailCount(): number {
		return this.mailCount;
	}

	public deleteMail(mailID: number): boolean {
		const originalLength = this.mailItems.length;
		this.mailItems = this.mailItems.filter(mail => mail.mailID !== mailID);
		if (this.mailItems.length < originalLength) {
			this.mailCount--;
			return true;
		}
		return false;
	}
}

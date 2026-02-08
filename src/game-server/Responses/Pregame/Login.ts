import { createPacket } from '../../PacketBuilder';
import { PacketType } from '../../PacketType';

export const enum LoginType {
	Fail = 0,
	Success = 4,
}

export const enum LoginFailType {
	None = 0,
	// Deprecated: WrongUser = 1, WrongPass = 2
	WrongUserOrPass = 3,
	NotActivated = 4,
	AccountBlocked = 5,
	IpBlocked = 6,
}

export function loginPacket(loginType: LoginType, loginFailType?: LoginFailType): Buffer {
	let packet = createPacket(20);
	packet.writeUInt32LE(PacketType.LoginResponse, 8);
	if (loginType == LoginType.Success) {
		packet.writeUInt16LE(LoginType.Success, 6);
		packet.writeUInt32LE(LoginFailType.None, 12);
	} else {
		packet.writeUInt16LE(LoginType.Fail, 6);

		if (loginFailType) {
			packet.writeUInt32LE(loginFailType, 12);
		} else {
			packet.writeUInt32LE(LoginFailType.None, 12);
		}
	}

	packet.writeUInt32LE(3600, 16); // Expiry?

	return packet;
}

export class PlayerVendor {
	public type: 'item' | 'pet';

	public slotID: number;

	public price: number;

	public constructor(type: 'item' | 'pet', slotID: number, price: number) {
		this.type = type;
		this.slotID = slotID;
		this.price = price;
	}
}

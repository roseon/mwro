export class PlayerFriends {
	private friends: {
		id: number;
		points: number;
	}[] = [];

	public addFriend(friendID: number): boolean {
		// Check if friend already exists
		if (this.friends.some(friend => friend.id === friendID)) {
			return false; // Friend already exists
		}

		this.friends.push({
			id: friendID,
			points: 0, // Points still start at 0 for new friends
		});

		return true; // Friend was successfully added
	}

	public setFriendPoints(friendID: number, points: number): boolean {
		const friend = this.friends.find(friend => friend.id === friendID);
		if (!friend) {
			return false; // Friend not found
		}
		friend.points = points;
		return true;
	}

	public getFriendPoints(friendID: number): number {
		const friend = this.friends.find(friend => friend.id === friendID);
		return friend?.points ?? 0;
	}

	public getFriendIDs(): number[] {
		return this.friends.map(friend => friend.id);
	}

	public getFriendsArray(): {
		id: number;
		points: number;
	}[] {
		return [...this.friends]; // Return a copy to prevent direct modification
	}

	public hasFriend(friendID: number): boolean {
		return this.friends.some(friend => friend.id === friendID);
	}

	public removeFriend(friendID: number): boolean {
		const index = this.friends.findIndex(friend => friend.id === friendID);
		if (index !== -1) {
			this.friends.splice(index, 1);
			return true;
		}
		return false;
	}

	public toJson(): {
		id: number;
		points: number;
	}[] {
		return [...this.friends];
	}

	public static fromJson(
		data: {
			id: number;
			points: number;
		}[],
	): PlayerFriends {
		const friends = new PlayerFriends();
		friends.friends = [...data];
		return friends;
	}
}

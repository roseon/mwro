import { Monster } from './Monster';

export enum MonsterState {
	Idle = 0,
	Patrol = 1,
	Chase = 2,
	Attack = 3,
	Return = 4,
}

export class MonsterAI {
	public state: MonsterState = MonsterState.Idle;
	public lastUpdate: number = Date.now();

	public constructor(private monster: Monster) {}

	public update(): void {
		const now = Date.now();
		const delta = now - this.lastUpdate;
		this.lastUpdate = now;

		switch (this.state) {
			case MonsterState.Idle:
				this.updateIdle(delta);
				break;
			case MonsterState.Patrol:
				this.updatePatrol(delta);
				break;
			case MonsterState.Chase:
				this.updateChase(delta);
				break;
			case MonsterState.Attack:
				this.updateAttack(delta);
				break;
		}
	}

	private updateIdle(delta: number): void {
		// wander probability
		if (Math.random() < 0.05) {
			this.state = MonsterState.Patrol;
		}
	}

	private updatePatrol(delta: number): void {
		if (Math.random() < 0.05) {
			this.state = MonsterState.Idle;
		}
		// Move logic would go here
	}

	private updateChase(delta: number): void {
		// Chase logic
	}

	private updateAttack(delta: number): void {
		// Attack logic
	}
}

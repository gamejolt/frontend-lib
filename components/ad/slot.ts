export type AdSlotTargetingMap = { [k: string]: string | string[] | undefined };
export type AdSlotPos = 'top' | 'bottom' | 'preroll' | 'footer';

const LeaderboardSizes: [number, number][] = [[728, 90]];
const RectangleSizes: [number, number][] = [[300, 250]];

export class AdSlot {
	public isUsed = false;
	public slotSizes: [number, number][] = [];

	constructor(public adUnit: string, public size: 'leaderboard' | 'rectangle', public id: string) {
		this.slotSizes = size === 'leaderboard' ? LeaderboardSizes : RectangleSizes;
	}
}

export function AdSlotPosValidator(val: string) {
	return ['top', 'bottom', 'preroll', 'footer'].indexOf(val) !== -1;
}

export class TrophyDifficulties {
	static readonly DIFFICULTY_BRONZE = 1;
	static readonly DIFFICULTY_SILVER = 2;
	static readonly DIFFICULTY_GOLD = 3;
	static readonly DIFFICULTY_PLATINUM = 4;

	static readonly difficulties = [
		TrophyDifficulties.DIFFICULTY_BRONZE,
		TrophyDifficulties.DIFFICULTY_SILVER,
		TrophyDifficulties.DIFFICULTY_GOLD,
		TrophyDifficulties.DIFFICULTY_PLATINUM,
	];

	static readonly difficultyLabels: { [k: string]: string } = {
		[TrophyDifficulties.DIFFICULTY_BRONZE]: 'Bronze',
		[TrophyDifficulties.DIFFICULTY_SILVER]: 'Silver',
		[TrophyDifficulties.DIFFICULTY_GOLD]: 'Gold',
		[TrophyDifficulties.DIFFICULTY_PLATINUM]: 'Platinum',
	};
}

export type TrophyDifficulty = 1 | 2 | 3 | 4;

export interface BaseTrophy {
	difficulty: number;
	title: string;
	description: string;
	experience: number;
	img_thumbnail: string;
	has_thumbnail: boolean;
}

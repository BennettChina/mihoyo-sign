import { MiHoYoGame } from "./mihoyo";

type ErrorReason = {
	reason: string;
}

export type SignInResult = {
	games: {
		game: MiHoYoGame;
		result: GameSignInResult & Partial<ErrorReason>;
	}[];
	community: Record<string, string | number>
	uid: string | number;
}
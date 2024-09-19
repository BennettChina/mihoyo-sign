import { GameSignInCommand, MissionSignInCommand } from "./command";
import { MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";

export class GenshinImpactSignIn extends GameSignInCommand {
	protected name: string = "原神";
	protected act_id: string = "e202311201442471";
	protected game_id: number = 2;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		const headers = this.getHeader( account.deviceData );
		this.headers = {
			...headers,
			"x-rpc-signgame": "hk4e",
		}
		await super.signIn( account );
	}
}

export class GenshinImpactMissionSignIn extends MissionSignInCommand {
	protected name: string = "原神";
	protected gids: number = 2;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		this.headers = this.getHeader( account.deviceData );
		return super.signIn( account );
	}
}
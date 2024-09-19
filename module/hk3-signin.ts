import { GameSignInCommand, MissionSignInCommand } from "./command";
import { MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";

export class Hk3SignIn extends GameSignInCommand {
	protected name: string = "崩坏3";
	protected act_id: string = "e202306201626331";
	protected game_id: number = 1;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		const headers = this.getHeader( account.deviceData );
		this.headers = {
			...headers,
			"Referer": "https://webstatic.mihoyo.com/",
			"Origin": 'https://webstatic.mihoyo.com',
		}
		return super.signIn( account );
	}
	
}

export class Hk3MissionSignIn extends MissionSignInCommand {
	protected name: string = "崩坏3";
	protected gids: number = 1;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		this.headers = this.getHeader( account.deviceData );
		return super.signIn( account );
	}
}
import { GameSignInCommand, MissionSignInCommand } from "./command";
import { MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";

export class Hk2SignIn extends GameSignInCommand {
	protected name: string = "崩坏学园2";
	protected act_id: string = "e202203291431091";
	protected game_id: number = 3;
	
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

export class Hk2MissionSignIn extends MissionSignInCommand {
	protected name: string = "崩坏学园2";
	protected gids: number = 3;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		this.headers = this.getHeader( account.deviceData );
		return super.signIn( account );
	}
	
}
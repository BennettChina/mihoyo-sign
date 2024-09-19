import { GameSignInCommand, MissionSignInCommand } from "#/mihoyo-sign/module/command";
import { MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";

export class TearsOfThemisSignIn extends GameSignInCommand {
	protected name: string = "未定事件簿";
	protected act_id: string = "e202202251749321";
	protected game_id: number = 4;
	
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

export class TearsOfThemisMissionSignIn extends MissionSignInCommand {
	protected name: string = "未定事件簿";
	protected gids: number = 4;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		this.headers = this.getHeader( account.deviceData );
		return super.signIn( account );
	}
}
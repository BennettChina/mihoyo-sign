import { GameSignInCommand, MissionSignInCommand } from "#/mihoyo-sign/module/command";
import { MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";

export class ZenLessZoneSignIn extends GameSignInCommand {
	protected name: string = "绝区零";
	protected act_id: string = "e202406242138391";
	protected game_id: number = 8;
	
	constructor() {
		super();
		this.URL_HOME = "https://api-takumi.mihoyo.com/event/luna/zzz/home";
		this.URL_INFO = "https://api-takumi.mihoyo.com/event/luna/zzz/info";
		this.URL_EXTRA_AWARD = "https://api-takumi.mihoyo.com/event/luna/zzz/extra_award";
		this.URL_SIGN = "https://api-takumi.mihoyo.com/event/luna/zzz/sign";
	}
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		const headers = this.getHeader( account.deviceData );
		this.headers = {
			...headers,
			"x-rpc-signgame": "zzz",
		}
		return super.signIn( account );
	}
}

export class ZenLessZoneMissionSignIn extends MissionSignInCommand {
	protected name: string = "绝区零";
	protected gids: number = 8;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		this.headers = this.getHeader( account.deviceData );
		return super.signIn( account );
	}
}
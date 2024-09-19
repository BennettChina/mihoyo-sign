import { GameSignInCommand, MissionSignInCommand } from "./command";
import { MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";

export class StarRailSignIn extends GameSignInCommand {
	protected name: string = "崩坏·星穹铁道";
	protected act_id: string = "e202304121516551";
	protected game_id: number = 6;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		this.headers = this.getHeader( account.deviceData );
		return super.signIn( account );
	}
}

export class StarRailMissionSignIn extends MissionSignInCommand {
	protected name: string = "崩坏·星穹铁道";
	protected gids: number = 6;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		this.headers = this.getHeader( account.deviceData );
		return super.signIn( account );
	}
	
}
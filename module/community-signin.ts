import { MissionSignInCommand } from "#/mihoyo-sign/module/command";
import { MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";

export class CommunitySignIn extends MissionSignInCommand {
	protected name: string = "大别野";
	protected gids: number = 5;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		this.headers = this.getHeader( account.deviceData );
		return super.signIn( account );
	}
	
}
import { GenshinImpactMissionSignIn, GenshinImpactSignIn } from "#/mihoyo-sign/module/genshin-signin";
import { Command } from "#/mihoyo-sign/module/command";
import { StarRailMissionSignIn, StarRailSignIn } from "#/mihoyo-sign/module/starrail-signin";
import { Hk3MissionSignIn, Hk3SignIn } from "#/mihoyo-sign/module/hk3-signin";
import { ZenLessZoneMissionSignIn, ZenLessZoneSignIn } from "#/mihoyo-sign/module/zzz-signin";
import { CommunitySignIn } from "#/mihoyo-sign/module/community-signin";
import { Hk2MissionSignIn } from "#/mihoyo-sign/module/hk2-signin";
import { TearsOfThemisMissionSignIn } from "#/mihoyo-sign/module/wd-signin";
import { MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";

export class MiHoYoSign {
	private readonly commands: Command[];
	
	constructor() {
		this.commands = [
			new GenshinImpactSignIn(),
			new StarRailSignIn(),
			new Hk3SignIn(),
			new ZenLessZoneSignIn(),
			
			new CommunitySignIn(),
			new GenshinImpactMissionSignIn(),
			new Hk2MissionSignIn(),
			new Hk3MissionSignIn(),
			new StarRailMissionSignIn(),
			new TearsOfThemisMissionSignIn(),
			new ZenLessZoneMissionSignIn()
		];
	}
	
	public async execute( ...accounts: MiHoYoAccount[] ) {
		for ( const account of accounts ) {
			for ( const command of this.commands ) {
				await command.execute( account );
			}
		}
	}
}
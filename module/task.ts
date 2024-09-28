import { Job, scheduleJob } from "node-schedule";
import { config, renderer } from "#/mihoyo-sign/init";
import Bot from "ROOT";
import { Account } from "#/mihoyo-sign/module/account";
import { MiHoYoSign } from "#/mihoyo-sign/module/index";
import { sleep } from "@/utils/async";
import { getRandomNumber } from "@/utils/random";
import { MessageType } from "@/modules/message";
import { MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";
import { SignInResult } from "#/mihoyo-sign/types/signin";

export class Task {
	private readonly task_name: string;
	private readonly job: Job;
	
	constructor() {
		this.task_name = "miHoYo-signIn-task";
		this.job = scheduleJob( this.task_name, config.cron, async () => {
			if ( !config.captcha.auto ) {
				Bot.logger.info( "未设置自动打码，自动签到取消执行。" );
				return;
			}
			
			// 30分钟内任意挑选时间执行签到任务
			const time = Date.now() + getRandomNumber( 0, 30 * 60 * 1000 );
			scheduleJob( time, async () => {
				const dbKey = `adachi.miHoYo.auto-sign-in`;
				const autoList = await Bot.redis.getList( dbKey );
				for ( let userId of autoList ) {
					const qq = parseInt( userId );
					const accounts = await new Account().getAccounts( qq );
					for ( const account of accounts ) {
						await new MiHoYoSign().execute( account );
						// 每个账号签到后加入随机延时
						await sleep( getRandomNumber( 3000, 5000 ) );
					}
					await this.saveResult( qq, ...accounts );
					this.sendRender( qq ).catch( reason => Bot.logger.error( reason ) );
				}
			} )
		} )
	}
	
	public cancel( restart?: boolean ): boolean {
		return this.job.cancel( restart );
	}
	
	private async sendRender( userId: number ): Promise<void> {
		const resp = await renderer.asSegment( "/index.html", { qq: userId }, {
			width: 1080,
			height: 1920,
			deviceScaleFactor: 2
		} );
		const sendMessage = Bot.message.createMessageSender( MessageType.Private, userId );
		if ( resp.code === "ok" ) {
			await sendMessage( resp.data );
			return;
		}
		Bot.logger.error( resp.error );
		await sendMessage( "签到完成，图片渲染失败" );
	}
	
	private async saveResult( userId: number, ...accounts: MiHoYoAccount[] ): Promise<void> {
		const signResult: SignInResult[] = []
		for ( const account of accounts ) {
			const gameSignResult: any[] = [];
			for ( let game of account.games ) {
				const result = await Bot.redis.getHash( `adachi.miHoYo.signIn.${ game.uid }.${ game.gameId }` );
				if ( Object.keys( result ).length !== 0 ) {
					if ( result.extra_reward ) {
						result.extra_reward = JSON.parse( result.extra_reward );
					}
					const data = {
						result,
						game
					}
					gameSignResult.push( data );
				}
			}
			const communitySignResult = await Bot.redis.getHash( `adachi.miHoYo.signIn.${ account.uid }.bbs` );
			signResult.push( {
				games: gameSignResult,
				community: communitySignResult,
				uid: account.uid
			} )
		}
		
		await Bot.redis.setString( `adachi.miHoYo.signIn.${ userId }`, JSON.stringify( signResult ), 60 );
	}
}
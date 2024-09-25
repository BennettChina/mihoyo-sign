import { Job, scheduleJob } from "node-schedule";
import { config, renderer } from "#/mihoyo-sign/init";
import Bot from "ROOT";
import { Account } from "#/mihoyo-sign/module/account";
import { MiHoYoSign } from "#/mihoyo-sign/module/index";
import { sleep } from "@/utils/async";
import { getRandomNumber } from "@/utils/random";
import { MessageType } from "@/modules/message";

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
					const accounts = await new Account().getAccounts( parseInt( userId ) );
					for ( const account of accounts ) {
						await new MiHoYoSign().execute( account );
						// 每个账号签到后加入随机延时
						await sleep( getRandomNumber( 3000, 5000 ) );
					}
					this.sendRender( userId ).catch( reason => Bot.logger.error( reason ) );
				}
			} )
		} )
	}
	
	public cancel( restart?: boolean ): boolean {
		return this.job.cancel( restart );
	}
	
	private async sendRender( userId: number | string ): Promise<void> {
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
}
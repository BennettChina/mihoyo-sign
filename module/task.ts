import { Job, scheduleJob } from "node-schedule";
import { config } from "#/mihoyo-sign/init";
import Bot from "ROOT";
import { Account } from "#/mihoyo-sign/module/account";
import { MiHoYoSign } from "#/mihoyo-sign/module/index";
import { sleep } from "@/utils/async";
import { getRandomNumber } from "@/utils/random";

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
				}
			} )
		} )
	}
	
	public cancel( restart?: boolean ): boolean {
		return this.job.cancel( restart );
	}
}
import { DeviceData, MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";
import {
	bbsMissionSignIn,
	createCaptcha,
	gameSignIn,
	getGameSignInInfo,
	getGameSignInReward,
	getMissionInfo,
	getMissions,
	getValidate,
	querySignInStatus,
	verifyCaptcha
} from "#/mihoyo-sign/api/api";
import { config } from "#/mihoyo-sign/init";
import { sleep } from "@/utils/async";
import Bot from "ROOT";
import { MessageType } from "@/modules/message";
import { bbs_version } from "#/mihoyo-sign/utils/ds";
import { transformCookie, transformObj } from "#/mihoyo-sign/utils/format";
import { RiskError } from "#/mihoyo-sign/module/exception/risk-error";
import { GeetestValidate } from "#/mihoyo-sign/types/geetest";
import { NotFoundError } from "#/mihoyo-sign/module/exception/not-found";
import { AutoFailedException } from "#/mihoyo-sign/module/exception/auto-failed";


export interface Command {
	execute( account: MiHoYoAccount ): Promise<void>;
}

abstract class SignInCommand implements Command {
	
	protected db_prifix: string = "adachi.miHoYo.signIn";
	
	abstract signIn( account: MiHoYoAccount ): Promise<void>;
	
	async execute( account: MiHoYoAccount ): Promise<void> {
		await this.signIn( account );
	}
	
	protected async saveDB( key: string, value: Record<string | number, string | number> ): Promise<void> {
		await Bot.redis.setHash( key, value );
		await Bot.redis.setTimeout( key, 600 );
	}
	
	protected async getValidate( userId: number, gt: string, challenge: string ): Promise<GeetestValidate> {
		const url = config.captcha.viewUrl;
		const enabled = config.captcha.auto.enabled;
		if ( !enabled && !url ) {
			throw new NotFoundError( "未设置打码服务地址" );
		}
		let msg_id: number | undefined;
		if ( !enabled ) {
			const obj = new URL( url );
			obj.searchParams.append( "gt", gt );
			obj.searchParams.append( "challenge", challenge );
			const sendMessage = Bot.message.createMessageSender( MessageType.Private, userId );
			msg_id = await sendMessage( [ "请打开地址并完成验证。\n", obj.toString() ] );
		}
		let printed = false;
		for ( let i = 0; i < 24; i++ ) {
			await sleep( 5000 );
			try {
				const { geetest_challenge, geetest_validate, geetest_seccode } = await getValidate( gt, challenge );
				if ( !geetest_validate ) {
					continue;
				}
				
				msg_id && Bot.client.recallMessage( msg_id ).catch( reason => {
					Bot.logger.error( "[米游社签到] 撤回验证链接失败:", reason );
				} );
				return {
					geetest_challenge,
					geetest_validate,
					geetest_seccode
				}
			} catch ( error ) {
				if ( error instanceof NotFoundError ) {
					throw error;
				}
				if ( error instanceof AutoFailedException ) {
					Bot.logger.error( error.message );
					throw error;
				}
				if ( !printed ) {
					Bot.logger.info( error );
					printed = true;
				}
			}
		}
		throw "获取人机验证结果超时";
	}
}

export abstract class GameSignInCommand extends SignInCommand implements Command {
	protected abstract name: string;
	protected abstract act_id: string;
	protected abstract game_id: number;
	protected headers: Record<string, string | number> = {};
	protected URL_HOME: string = "https://api-takumi.mihoyo.com/event/luna/home";
	protected URL_EXTRA_AWARD: string = "https://api-takumi.mihoyo.com/event/luna/extra_award";
	protected URL_INFO: string = "https://api-takumi.mihoyo.com/event/luna/info";
	protected URL_SIGN: string = "https://api-takumi.mihoyo.com/event/luna/sign";
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		const { cookie, games, userId } = account;
		const game = games.find( ( game ) => game.gameId === this.game_id );
		if ( !game ) return;
		const db_key = `${ this.db_prifix }.${ game.uid }.${ this.game_id }`;
		try {
			const sign = await this.getSignInInfo( game.uid, game.region, cookie );
			const { is_sign } = sign;
			if ( !is_sign ) {
				// 开始签到
				const data = await this.gameSignIn( userId, game.uid, game.region, cookie );
				await this.saveDB( db_key, transformObj( data ) );
				return;
			}
			await this.saveDB( db_key, transformObj( sign ) );
		} catch ( error ) {
			if ( error instanceof RiskError ) {
				this.error( error.message );
				await this.saveDB( db_key, { reason: error.message } );
				return;
			}
			const reason = typeof error === "string" ? error : "签到异常";
			await this.saveDB( db_key, { reason } );
			this.error( error );
		}
	}
	
	protected getHeader( device: DeviceData ) {
		const idx = device.userAgent.indexOf( "(KHTML, like Gecko)" );
		const bbs_ua = `${ device.userAgent.slice( 0, idx + 19 ) } miHoYoBBS/${ bbs_version }`;
		return {
			"User-Agent": bbs_ua,
			"Referer": "https://act.mihoyo.com/",
			"Origin": 'https://act.mihoyo.com',
			"X_Requested_With": 'com.mihoyo.hyperion',
			"x-rpc-app_version": bbs_version,
			"x-rpc-client_type": 5,
			"DS": "",
			"Cookie": "",
			"x-rpc-device_id": device.deviceId,
			"x-rpc-device_fp": device.deviceFp,
			"x-rpc-app_id": "bll8iq97cem8",
			"x-rpc-signgame": ""
		};
	}
	
	private info( ...message: any[] ): void {
		Bot.logger.info( `[米游社签到] [游戏签到] [${ this.name }]`, ...message );
	}
	
	private error( ...message: any[] ): void {
		Bot.logger.error( `[米游社签到] [游戏签到] [${ this.name }]`, ...message );
	}
	
	private async getSignInInfo( uid: string, region: string, cookie: string ): Promise<GameSignInResult> {
		const sign = await getGameSignInInfo( this.URL_INFO, this.act_id, uid, region, cookie, this.headers );
		const { is_sign, total_sign_day, sign_cnt_missed, short_sign_day } = sign;
		if ( !is_sign ) return sign;
		
		const {
			awards,
			month,
			short_extra_award
		} = await getGameSignInReward( this.URL_HOME, this.act_id, uid, region, cookie, this.headers );
		const reward = awards[total_sign_day - 1];
		if ( short_extra_award.has_extra_award && short_sign_day <= short_extra_award.list.length ) {
			const extra_reward = short_extra_award.list[short_sign_day - 1];
			this.info( `[${ uid }] 本日已签到，${ month }月已连续签到${ total_sign_day }天，漏签${ sign_cnt_missed }次，今日奖励为: ${ reward.name } x ${ reward.cnt } 和活动签到奖励 ${ extra_reward.name } x ${ extra_reward.cnt }` );
			return { ...sign, ...reward, has_extra_award: true, extra_reward };
		}
		this.info( `[${ uid }] 本日已签到，${ month }月已连续签到${ total_sign_day }天，漏签${ sign_cnt_missed }次，今日奖励为: ${ reward.name } x ${ reward.cnt }` );
		return { ...sign, ...reward };
	}
	
	private async gameSignIn( userId: number, uid: string, region: string, cookie: string
		, challenge?: string, validate?: string, seccode?: string, retry = 0 ): Promise<GameSignInResult> {
		const headers = this.headers;
		if ( challenge && validate ) {
			headers["x-rpc-challenge"] = challenge;
			headers["x-rpc-validate"] = validate;
			headers["x-rpc-seccode"] = seccode || `${ validate }|jordan`;
		}
		const sign = await gameSignIn( this.URL_SIGN, this.act_id, uid, region, cookie, headers );
		if ( sign.risk_code === 0 && sign.success === 0 ) {
			return await this.getSignInInfo( uid, region, cookie );
		}
		this.info( `[${ uid }] 签到失败，遇到风控验证，需要处理人机验证。` );
		if ( retry >= 3 ) {
			throw new RiskError( `[${ this.name }] 签到失败，人机验证未通过` );
		}
		try {
			const {
				geetest_challenge,
				geetest_validate,
				geetest_seccode
			} = await this.getValidate( userId, sign.gt, sign.challenge );
			return this.gameSignIn( userId, uid, region, cookie, geetest_challenge, geetest_validate, geetest_seccode, ++retry );
		} catch ( error ) {
			// 自动打码失败也加入重试
			if ( error instanceof AutoFailedException ) {
				return this.gameSignIn( userId, uid, region, cookie, undefined, undefined, undefined, ++retry );
			}
			throw error;
		}
	}
}

export abstract class MissionSignInCommand extends SignInCommand implements Command {
	protected abstract name: string;
	protected abstract gids: number;
	protected headers: Record<string, string | number> = {};
	private validate: boolean = false;
	
	async signIn( account: MiHoYoAccount ): Promise<void> {
		const uid = account.uid;
		const db_key = `${ this.db_prifix }.${ uid }.bbs`;
		try {
			const { stoken } = transformCookie( account.cookie );
			if ( !stoken ) {
				this.warn( `[${ uid }] 无 SToken 跳过社区签到` );
				await this.saveDB( db_key, { [`${ this.gids }`]: "无SToken无法进行社区签到" } );
				return;
			}
			
			const { is_signed } = await querySignInStatus( this.gids, account.cookie, this.headers );
			if ( is_signed ) {
				this.info( `[${ uid }] 今日已签到` );
				await this.saveDB( db_key, { [`${ this.gids }`]: 0 } );
				await this.getMissionInfo( account );
				return;
			}
			
			const { points } = await bbsMissionSignIn( this.gids, account.cookie, this.headers );
			if ( points >= 0 ) {
				this.info( `[${ uid }] 签到成功，获得米游币: ${ points }` );
				if ( points > 0 ) {
					await this.getMissionInfo( account );
				}
				await this.saveDB( db_key, { [`${ this.gids }`]: points } );
				return;
			}
			this.warn( `[${ uid }] 疑似签到失败，获取的米游币数量异常: ${ points }` );
		} catch ( error ) {
			if ( error instanceof RiskError ) {
				this.warn( error.message );
				this.info( "进行人机验证，重试一次" );
				if ( this.validate ) {
					await this.saveDB( db_key, { [`${ this.gids }`]: error.message } );
					return;
				}
				try {
					const { gt, challenge } = await createCaptcha( account.cookie, this.headers );
					const validate = await this.getValidate( account.userId, gt, challenge );
					await verifyCaptcha( validate, account.cookie, this.headers );
					this.validate = true;
					await this.signIn( account );
				} catch ( err ) {
					this.error( err );
					await this.saveDB( db_key, { [`${ this.gids }`]: "未通过风控验证" } );
					return;
				}
			}
			const reason = typeof error === "string" ? error : "签到异常";
			await this.saveDB( db_key, { [`${ this.gids }`]: reason } );
			this.error( error );
		}
	}
	
	protected getHeader( device: DeviceData ): Record<string, string | number> {
		return {
			"user-agent": "okhttp/4.9.3",
			Referer: "https://app.mihoyo.com",
			"x-rpc-verify_key": "bll8iq97cem8",
			"x-rpc-client_type": "2",
			"x-rpc-device_fp": device.deviceFp,
			"x-rpc-device_id": device.deviceId.toUpperCase(),
			"x-rpc-device_model": "MI 11 Pro",
			"x-rpc-device_name": "Xiaomi MI 11 Pro",
			"x-rpc-sys_version": "13",
			"x-rpc-app_version": bbs_version,
			"x-rpc-csm_source": "discussion",
			"x-rpc-channel": "miyousheluodi",
			"x-rpc-h265_supported": "1",
			Cookie: ""
		}
	}
	
	private async getMissionInfo( account: MiHoYoAccount ): Promise<void> {
		const uid = account.uid;
		const info = await getMissionInfo( account.cookie, this.headers );
		this.info( `[${ uid }]已获得米游币: ${ info.total_points }` );
		const data = {
			"total_points": info.total_points,
		}
		const missions = await getMissions( account.cookie, this.getWebHeader( account.deviceData ) );
		
		const is_sign = info.states.find( ( item: {
			mission_key: string;
		} ) => item.mission_key === 'continuous_sign' )?.is_get_award;
		
		const times = missions.missions.find( ( item: {
			mission_key: string;
		} ) => item.mission_key === 'continuous_sign' )?.continuous_cycle_times;
		
		if ( is_sign ) {
			data["5"] = times < 3 ? 30 : times < 5 ? 40 : 50;
			data["is_signed"] = "true";
		}
		data["signin_times"] = times || 0;
		await this.saveDB( `${ this.db_prifix }.${ uid }.bbs`, data );
	}
	
	private info( ...message: any[] ): void {
		Bot.logger.info( `[米游社签到] [社区签到] [${ this.name }]`, ...message );
	}
	
	private warn( ...message: any[] ): void {
		Bot.logger.warn( `[米游社签到] [社区签到] [${ this.name }]`, ...message );
	}
	
	private error( ...message: any[] ): void {
		Bot.logger.error( `[米游社签到] [社区签到] [${ this.name }]`, ...message );
	}
	
	private getWebHeader( device: DeviceData ): Record<string, string | number> {
		const idx = device.userAgent.indexOf( "(KHTML, like Gecko)" );
		const bbs_ua = `${ device.userAgent.slice( 0, idx + 19 ) } miHoYoBBS/${ bbs_version }`;
		return {
			"user-agent": bbs_ua,
			Origin: "https://webstatic.miyoushe.com",
			Referer: "https://webstatic.miyoushe.com/",
		}
	}
}
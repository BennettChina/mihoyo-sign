import axios, { AxiosError } from "axios";
import { ds, ds2, ds3 } from "#/mihoyo-sign/utils/ds";
import { config } from "#/mihoyo-sign/init";
import { transformCookie } from "#/mihoyo-sign/utils/format";
import { RiskError } from "#/mihoyo-sign/module/exception/risk-error";
import { GeetestConfig, GeetestValidate } from "#/mihoyo-sign/types/geetest";
import { NotConfigError } from "#/mihoyo-sign/module/exception/not-config";
import { getRootVersion, getThisVersion } from "#/mihoyo-sign/utils/version";
import { AutoFailedException } from "#/mihoyo-sign/module/exception/auto-failed";
import Bot from "ROOT";

const apis = {
	FETCH_ROLE_ID: "https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/getGameRecordCard",
	
	// 游戏签到
	FETCH_SIGN_IN: "https://api-takumi.mihoyo.com/event/luna/sign",
	FETCH_SIGN_INFO: "https://api-takumi.mihoyo.com/event/luna/info",
	FETCH_SIGN_REWARD: "https://api-takumi.mihoyo.com/event/luna/home",
	
	// 验证码服务相关
	FETCH_CREATE_VERIFICATION: "https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/createVerification",
	FETCH_VERIFY_VERIFICATION: "https://api-takumi-record.mihoyo.com/game_record/app/card/wapi/verifyVerification",
	
	/* 获取device_fp */
	FETCH_GET_DEVICE_FP: "https://public-data-api.mihoyo.com/device-fp/api/getFp",
	
	// 社区签到
	FETCH_MISSION_SIGN: "https://bbs-api.mihoyo.com/apihub/app/api/signIn",
	
	// 社区签到状态
	FETCH_MISSION_SIGN_STATUS: "https://bbs-api.miyoushe.com/apihub/sapi/querySignInStatus",
	
	/* 获取米游币数量 */
	FETCH_MISSION: "https://bbs-api.miyoushe.com/apihub/sapi/getUserMissionsState",
	/* 获取任务列表 */
	FETCH_MISSION_LIST: "https://bbs-api.miyoushe.com/apihub/wapi/getMissions?point_sn=myb",
	
	// 米游社验证码
	FETCH_MISSION_CREATE_VERIFICATION: "https://bbs-api.miyoushe.com/misc/api/createVerification",
	FETCH_MISSION_VERIFY_VERIFICATION: "https://bbs-api.miyoushe.com/misc/api/verifyVerification",
};

// 设置全局超时时间
const DEFAULT_TIMEOUT = 5000;
axios.defaults.timeout = DEFAULT_TIMEOUT;

export async function getDeviceFp( device_id: string, seed_id: string, seed_time: string, ext_fields: string, device_fp: string, platform: string = "4", app_name: string = "bbs_cn" ): Promise<string> {
	const response = await axios.post( apis.FETCH_GET_DEVICE_FP, {
		seed_id,
		device_id,
		platform,
		seed_time,
		ext_fields,
		app_name,
		device_fp
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	
	const data = response.data;
	if ( data.retcode !== 0 ) {
		return Promise.reject( data.message );
	}
	
	if ( data.data.code !== 200 ) {
		return Promise.reject( data.data.msg );
	}
	
	return data.data.device_fp;
}

export async function getUserAccountInfo( uid: number, cookie: string, headers: Record<string, string | number> ) {
	const params = { uid };
	const { stoken, stuid, mid, login_ticket } = transformCookie( cookie );
	cookie = transformCookie( { stuid, stoken, mid, login_ticket } );
	const { data: response } = await axios.get( apis.FETCH_ROLE_ID, {
		params,
		headers: {
			...headers,
			"Referer": "https://webstatic.mihoyo.com",
			"Origin": 'https://webstatic.mihoyo.com',
			"X_Requested_With": 'com.mihoyo.hyperion',
			"x-rpc-client_type": "2",
			"x-rpc-app_id": "bll8iq97cem8",
			"Cookie": cookie,
			"DS": ds( "bbs" ),
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	
	if ( response.data.retcode === 1034 ) {
		throw new RiskError( "[查询账户信息] 遇到风控需要人机验证" );
	}
	
	if ( response.data.retcode !== 0 ) {
		return Promise.reject( `[查询账户信息] ${ response.data.message }` );
	}
	return response;
}

export async function getGameSignInInfo( uri: string, act_id: string, uid: string, region: string, cookie: string, headers: Record<string, string | number> ): Promise<GameSignInfo> {
	const params = { act_id, uid, region, lang: "zh-cn" };
	const { cookie_token, ltoken, ltuid, deviceId, deviceFp, seedId, seedTime } = transformCookie( cookie );
	cookie = transformCookie( {
		account_id: ltuid,
		cookie_token,
		ltoken,
		ltuid,
		mi18nLang: "zh-cn",
		DEVICEFP: deviceFp,
		_MHYUUID: deviceId,
		DEVICEFP_SEED_ID: seedId,
		DEVICEFP_SEED_TIME: seedTime
	} )
	const response = await axios.get( uri, {
		params,
		headers: {
			...headers,
			"Cookie": cookie,
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	
	if ( response.data.retcode === 1034 ) {
		throw new RiskError( "[查询签到信息] 遇到风控需要人机验证" );
	}
	
	if ( response.data.retcode !== 0 ) {
		return Promise.reject( `[查询签到信息] ${ response.data.message }` );
	}
	
	return response.data.data;
}

export async function getGameSignInReward( uri: string, act_id: string, uid: string, region: string, cookie: string, headers: Record<string, string | number> ): Promise<GameSignInReward> {
	const params = { act_id, uid, region, lang: "zh-cn" };
	const { cookie_token, ltoken, ltuid, deviceId, deviceFp, seedId, seedTime } = transformCookie( cookie );
	cookie = transformCookie( {
		account_id: ltuid,
		cookie_token,
		ltoken,
		ltuid,
		mi18nLang: "zh-cn",
		DEVICEFP: deviceFp,
		_MHYUUID: deviceId,
		DEVICEFP_SEED_ID: seedId,
		DEVICEFP_SEED_TIME: seedTime
	} )
	const response = await axios.get( uri, {
		params,
		headers: {
			...headers,
			"Cookie": cookie,
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	if ( response.data.retcode === 1034 ) {
		throw new RiskError( "[查询签到奖励] 遇到风控需要人机验证" );
	}
	
	if ( response.data.retcode !== 0 ) {
		return Promise.reject( `[查询签到奖励] ${ response.data.message }` );
	}
	
	return response.data.data;
}

export async function gameSignIn( uri: string, act_id: string, uid: string, region: string, cookie: string, headers: Record<string, string | number> ): Promise<GameSignIn> {
	const data = { act_id, uid, region, lang: "zh-cn" };
	const response = await axios.post( uri, data, {
		headers: {
			...headers,
			"Cookie": cookie,
			"DS": ds( "sign_in" )
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	if ( response.data.retcode !== 0 ) {
		return Promise.reject( `[发起游戏签到] ${ response.data.message }` );
	}
	
	return response.data.data;
}

export async function getValidate( gt: string, challenge: string, manual?: boolean ): Promise<GeetestValidate> {
	// 自动验证
	if ( !manual && config.captcha.auto.enabled ) {
		return getValidateByAuto( gt, challenge );
	}
	
	// 获取手动验证的结果
	const url = config.captcha.apiUrl;
	if ( !url ) throw new NotConfigError( "未设置 API 服务的地址无法获取到人机验证结果。" );
	
	const response = await axios.get( url, {
		params: {
			challenge
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	
	if ( response.data.code === 1404 ) {
		// empty data.
		return { geetest_challenge: "", geetest_validate: "" };
	}
	
	if ( response.data.code !== 0 ) {
		return Promise.reject( `[获取人机验证结果] ${ response.data.message }` );
	}
	
	if ( !response.data.data ) {
		return Promise.reject( `[获取人机验证结果] ${ response.data.message }` );
	}
	
	return response.data.data;
}

async function getValidateByAuto( gt: string, challenge: string ): Promise<GeetestValidate> {
	const { method, api, headers, params, response, timeout } = config.captcha.auto;
	let p: any | undefined, d: any | undefined;
	if ( method === "get" ) {
		p = {
			...params,
			gt,
			challenge
		}
	} else {
		d = {
			...params,
			gt,
			challenge
		}
		
	}
	const { data } = await axios.request( {
		method: method,
		url: api,
		headers: {
			"User-Agent": `Adachi-Bot/${ getRootVersion() } mihoyo-sign/${ getThisVersion() }`,
			...headers,
		},
		timeout,
		params: p,
		data: d
	} ).catch( ( reason: AxiosError ) => {
		throw new AutoFailedException( reason.message );
	} );
	
	Bot.logger.info( "[获取人机验证结果] [auto]", JSON.stringify( data ) );
	
	if ( data[response.codeFieldName] != response.successCode ) {
		let error = data[response.messageFieldName];
		if ( !error ) {
			error = JSON.stringify( data );
		} else if ( typeof error !== 'string' ) {
			error = JSON.stringify( error );
		}
		throw new AutoFailedException( `[获取人机验证结果] [auto] ${ error }` );
	}
	
	const result = data[response.dataFieldName];
	if ( !result ) {
		throw new AutoFailedException( `[获取人机验证结果] [auto] 未获取到数据: ${ data[response.messageFieldName] }` );
	}
	const validate = result[response.validateFieldName];
	return {
		geetest_challenge: challenge,
		geetest_validate: validate,
		geetest_seccode: `${ validate }|jordan`
	}
}

export async function querySignInStatus( gids: string | number, cookie: string, headers: Record<string, string | number> ) {
	const params = { gids };
	const { stoken, stuid, mid, login_ticket } = transformCookie( cookie );
	cookie = transformCookie( { stuid, stoken, mid, login_ticket } );
	const response = await axios.get( apis.FETCH_MISSION_SIGN_STATUS, {
		params,
		headers: {
			...headers,
			"Cookie": cookie,
			"DS": ds2( "bbs", undefined, params )
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	
	if ( response.data.retcode === 1034 ) {
		throw new RiskError( "[查询社区签到状态] 遇到风控需要人机验证" );
	}
	
	if ( response.data.retcode !== 0 ) {
		return Promise.reject( `[查询社区签到状态] ${ response.data.message }` );
	}
	return response.data.data;
}

export async function bbsMissionSignIn( gids: string | number, cookie: string, headers: Record<string, string | number> ) {
	const data = { gids };
	const { stoken, stuid, mid, login_ticket } = transformCookie( cookie );
	cookie = transformCookie( { stuid, stoken, mid, login_ticket } );
	const response = await axios.post( apis.FETCH_MISSION_SIGN, data, {
		headers: {
			...headers,
			"Cookie": cookie,
			"DS": ds3( "sign_in", data )
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	
	if ( response.data.retcode === 1034 ) {
		throw new RiskError( "[发起社区签到] 遇到风控需要人机验证" );
	}
	
	if ( response.data.retcode !== 0 ) {
		return Promise.reject( `[发起社区签到] ${ response.data.message }` );
	}
	return response.data.data;
}

export async function getMissionInfo( cookie: string, headers: Record<string, string | number> ) {
	const { stoken, stuid, mid, login_ticket } = transformCookie( cookie );
	cookie = transformCookie( { stuid, stoken, mid, login_ticket } );
	const response = await axios.get( apis.FETCH_MISSION, {
		headers: {
			...headers,
			Cookie: cookie,
			"DS": ds( "bbs" )
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	
	if ( response.data.retcode === 1034 ) {
		throw new RiskError( "[获取米游币信息] 遇到风控需要人机验证" );
	}
	
	if ( response.data.retcode !== 0 ) {
		return Promise.reject( `[获取米游币信息] ${ response.data.message }` );
	}
	return response.data.data;
}

export async function createCaptcha( cookie: string, headers: Record<string, string | number> ): Promise<GeetestConfig> {
	const { stoken, stuid, mid, login_ticket } = transformCookie( cookie );
	cookie = transformCookie( { stuid, stoken, mid, login_ticket } );
	
	const params = {
		is_high: "true"
	}
	const response = await axios.get( apis.FETCH_MISSION_CREATE_VERIFICATION, {
		params,
		headers: {
			...headers,
			Cookie: cookie,
			DS: ds2( "bbs", undefined, params )
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	
	if ( response.data.retcode !== 0 ) {
		return Promise.reject( `[创建人机验证码] ${ response.data.message }` );
	}
	
	const { gt, challenge } = response.data.data;
	return { gt, challenge };
}

export async function verifyCaptcha( data: GeetestValidate, cookie: string, headers: Record<string, string | number> ): Promise<void> {
	const { stoken, stuid, mid, login_ticket } = transformCookie( cookie );
	cookie = transformCookie( { stuid, stoken, mid, login_ticket } );
	data.geetest_seccode = data.geetest_seccode || `${ data.geetest_validate }|jordan`;
	const response = await axios.post( apis.FETCH_MISSION_VERIFY_VERIFICATION, data, {
		headers: {
			...headers,
			Cookie: cookie,
			DS: ds2( "bbs", data )
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	
	if ( response.data.retcode !== 0 ) {
		return Promise.reject( `[人机验证校验失败] ${ response.data.message }` );
	}
}

export async function getMissions( cookie: string, headers: Record<string, string | number> ) {
	const {
		cookie_token,
		ltoken,
		ltuid,
		deviceId,
		deviceFp,
		seedId,
		seedTime,
		login_ticket
	} = transformCookie( cookie );
	cookie = transformCookie( {
		account_id: ltuid,
		cookie_token,
		ltoken,
		ltuid,
		login_ticket,
		DEVICEFP: deviceFp,
		_MHYUUID: deviceId,
		DEVICEFP_SEED_ID: seedId,
		DEVICEFP_SEED_TIME: seedTime
	} )
	const response = await axios.get( apis.FETCH_MISSION_LIST, {
		headers: {
			...headers,
			Cookie: cookie
		}
	} ).catch( ( reason: AxiosError ) => {
		throw new Error( reason.message );
	} );
	
	if ( response.data.retcode === 1034 ) {
		throw new RiskError( "[获取米游币任务列表] 遇到风控需要人机验证" );
	}
	
	if ( response.data.retcode !== 0 ) {
		return Promise.reject( `[获取米游币任务列表] ${ response.data.message }` );
	}
	return response.data.data;
}
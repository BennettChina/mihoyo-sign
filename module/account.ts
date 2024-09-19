import { InputParameter } from "@/modules/command";
import { DeviceData, MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";
import { transformCookie } from "#/mihoyo-sign/utils/format";
import { bbs_version } from "#/mihoyo-sign/utils/ds";
import { getDeviceFp, getUserAccountInfo } from "#/mihoyo-sign/api/api";
import { deviceFp, getMiHoYoRandomStr, getMiHoYoUuid, getPlugins, randomEvenNum } from "#/mihoyo-sign/utils/device-fp";
import { Md5 } from "md5-typescript";
import UserAgent from "user-agents";
import plat from "platform";

export class Account {
	public async getAccounts( { redis, messageData }: InputParameter ): Promise<MiHoYoAccount[]> {
		const userId = messageData.user_id;
		const deviceDBKey = `adachi.miHoYo.${ Md5.init( userId ) }`;
		let dbKey = `adachi.miHoYo.data.`;
		const device = ( await redis.getHash( deviceDBKey ) as DeviceData );
		if ( device.deviceId ) {
			await getDeviceFp( device.deviceId, device.seedId, device.seedTime, JSON.stringify( this.getExtFields() ), device.deviceFp, "5", "hk4e_cn" );
			const keys = await redis.getKeysByPrefix( dbKey );
			const accounts: MiHoYoAccount[] = [];
			for ( let key of keys ) {
				const data = await redis.getHash( key );
				if ( parseInt( data.userId ) === userId ) {
					const ck = transformCookie( data.cookie );
					const cookie = transformCookie( {
						...ck,
						deviceId: device.deviceId,
						deviceFp: device.deviceFp,
						seedId: device.seedId,
						seedTime: device.seedTime
					} )
					accounts.push( {
						uid: parseInt( data.uid ),
						userId: parseInt( data.userId ),
						cookie,
						games: JSON.parse( data.games ),
						deviceData: device
					} );
				}
			}
			return accounts.sort( ( a, b ) => a.uid - b.uid );
		}
		
		dbKey = "silvery-star.private-";
		const keys = await redis.getKeysByPrefix( dbKey );
		const accounts: MiHoYoAccount[] = [];
		const deviceData = await this.createDevice();
		const headers = {
			"User-Agent": deviceData.userAgent,
			"x-rpc-device_fp": deviceData.deviceFp,
			"x-rpc-device_id": deviceData.deviceId.toUpperCase(),
			'x-rpc-app_version': bbs_version,
		}
		for ( let key of keys ) {
			const data = await redis.getString( key );
			const account = JSON.parse( data ).setting;
			if ( account.userID === userId ) {
				const { list }: { list: any[] } = await getUserAccountInfo( account.mysID, account.cookie, headers );
				if ( !list || list.length === 0 ) {
					continue;
				}
				
				const games = list.map( item => {
					return {
						gameId: item.game_id,
						gameName: item.game_name,
						uid: item.game_role_id,
						nickname: item.nickname,
						region: item.region,
						level: item.level,
						regionName: item.region_name
					}
				} );
				const ck = transformCookie( account.cookie );
				const cookie = transformCookie( {
					...ck,
					deviceId: deviceData.deviceId,
					deviceFp: deviceData.deviceFp,
					seedId: deviceData.seedId,
					seedTime: deviceData.seedTime
				} )
				accounts.push( {
					uid: account.mysID,
					userId,
					cookie,
					games,
					deviceData
				} )
			}
		}
		return accounts.sort( ( a, b ) => a.uid - b.uid );
	}
	
	
	public async createDevice(): Promise<DeviceData> {
		const deviceId = getMiHoYoUuid();
		let device_fp = deviceFp();
		const lifecycleId = getMiHoYoUuid();
		const seedId = getMiHoYoRandomStr( 16 );
		const seedTime = `${ Date.now() }`;
		
		const ext_fields = this.getExtFields();
		const userAgent = ext_fields.userAgent;
		device_fp = await getDeviceFp( deviceId, seedId, seedTime, JSON.stringify( ext_fields ), device_fp, "5", "hk4e_cn" );
		
		return {
			userAgent,
			deviceId,
			deviceFp: device_fp,
			lifecycleId,
			seedId,
			seedTime
		}
	}
	
	private getExtFields() {
		const userAgent = new UserAgent( ( data ) => {
			const os = plat.parse( data.userAgent ).os;
			if ( !os ) return true;
			return os.family === "iOS" && parseInt( os.version || "16", 10 ) >= 16;
		} );
		const { platform, pluginsLength, vendor, viewportWidth, viewportHeight } = userAgent.data;
		
		const plugins = getPlugins( pluginsLength );
		const ratio = `${ randomEvenNum( 2, 8 ) }`;
		const ua = userAgent.toString();
		const idx = ua.indexOf( "(KHTML, like Gecko)" )
		const bbs_ua = `${ ua.slice( 0, idx + 19 ) } miHoYoBBS/${ bbs_version }`;
		return {
			userAgent: bbs_ua,
			browserScreenSize: `${ viewportWidth * viewportHeight }`,
			maxTouchPoints: "5",
			isTouchSupported: "1",
			browserLanguage: "zh-CN",
			browserPlat: platform,
			browserTimeZone: "Asia/Shanghai",
			webGlRender: "Apple GPU",
			webGlVendor: vendor,
			numOfPlugins: plugins.length,
			listOfPlugins: plugins,
			screenRatio: ratio,
			deviceMemory: "unknown",
			hardwareConcurrency: `${ randomEvenNum( 2, 16 ) }`,
			cpuClass: "unknown",
			ifNotTrack: "unknown",
			ifAdBlock: "0",
			hasLiedLanguage: "0",
			hasLiedResolution: "1",
			hasLiedOs: "0",
			hasLiedBrowser: "0",
			canvas: getMiHoYoRandomStr( 64 ),
			webDriver: "0",
			colorDepth: `${ randomEvenNum( 12, 32 ) }`,
			pixelRatio: ratio,
			packageName: "unknown",
			packageVersion: "2.29.0",
			webgl: getMiHoYoRandomStr( 64 )
		};
	}
}
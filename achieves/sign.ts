import { defineDirective, InputParameter } from "@/modules/command";
import { MiHoYoAccount } from "#/mihoyo-sign/types/mihoyo";
import { MiHoYoSign } from "#/mihoyo-sign/module";
import { SignInResult } from "#/mihoyo-sign/types/signin";
import { Account } from "#/mihoyo-sign/module/account";
import { renderer } from "#/mihoyo-sign/init";

export default defineDirective( "order", async ( i: InputParameter ) => {
	const { messageData: { user_id }, sendMessage, redis } = i;
	const rawMessage = i.messageData.raw_message;
	const accounts = await new Account().getAccounts( i );
	if ( accounts.length === 0 ) {
		await sendMessage( "未找到您绑定的米游社账号，请使用登录米游社功能或者添加私人服务功能" );
		return;
	}
	if ( rawMessage ) {
		// 仅签到一个账号
		const index = parseInt( rawMessage ) - 1;
		if ( index >= accounts.length ) {
			await sendMessage( "您没有绑定这么多账号，请通过查看绑定账户功能获取您绑定的账户序号" );
			return;
		}
		const miHoYoSign = new MiHoYoSign();
		const account = accounts[index];
		await miHoYoSign.execute( account );
		
		const signResult = await getSignResult( i, account );
		await redis.setString( `adachi.miHoYo.signIn.${ user_id }`, JSON.stringify( signResult ), 60 );
		await sendResult( i );
		return;
	}
	
	// 签到所有账号
	const miHoYoSign = new MiHoYoSign();
	await miHoYoSign.execute( ...accounts );
	
	const signResult = await getSignResult( i, ...accounts );
	await redis.setString( `adachi.miHoYo.signIn.${ user_id }`, JSON.stringify( signResult ), 60 );
	await sendResult( i );
	return;
} )

async function getSignResult( { redis }: InputParameter, ...accounts: MiHoYoAccount[] ): Promise<SignInResult[]> {
	const signResult: SignInResult[] = []
	for ( const account of accounts ) {
		const gameSignResult: any[] = [];
		for ( let game of account.games ) {
			const result = await redis.getHash( `adachi.miHoYo.signIn.${ game.uid }.${ game.gameId }` );
			if ( Object.keys( result ).length !== 0 ) {
				const data = {
					result,
					game
				}
				gameSignResult.push( data );
			}
		}
		const communitySignResult = await redis.getHash( `adachi.miHoYo.signIn.${ account.uid }.bbs` );
		signResult.push( {
			games: gameSignResult,
			community: communitySignResult,
			uid: account.uid
		} )
	}
	return signResult;
}

async function sendResult( { sendMessage, messageData, logger }: InputParameter ) {
	const resp = await renderer.asSegment( "/index.html", { qq: messageData.user_id }, {
		width: 1080,
		height: 1920,
		deviceScaleFactor: 2
	} );
	if ( resp.code === "ok" ) {
		await sendMessage( resp.data );
		return;
	}
	logger.error( resp.error );
	await sendMessage( "签到完成，图片渲染失败" );
}
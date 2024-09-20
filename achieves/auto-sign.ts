import { defineDirective, InputParameter } from "@/modules/command";
import { config } from "#/mihoyo-sign/init";
import { Account } from "#/mihoyo-sign/module/account";

export default defineDirective( "switch", async ( input: InputParameter ) => {
	const { sendMessage, redis, messageData, matchResult: { isOn } } = input;
	if ( !config.captcha.auto.enabled ) {
		await sendMessage( "抱歉，该功能未被主人启用" );
		return;
	}
	
	const dbKey = `adachi.miHoYo.auto-sign-in`;
	const userId = messageData.user_id;
	const exist = await redis.existListElement( dbKey, userId );
	if ( isOn && exist ) {
		await sendMessage( "你的账号已启用自动签到" );
		return;
	}
	if ( !isOn ) {
		await redis.delListElement( dbKey, `${ userId }` );
		await sendMessage( "已为你关闭自动签到" );
		return;
	}
	const accounts = await new Account().getAccounts( userId );
	if ( accounts.length === 0 ) {
		await sendMessage( "抱歉，你未绑定通行证账号，无法使用该功能" );
		return;
	}
	
	await redis.addListElement( dbKey, `${ userId }` );
	await sendMessage( "已为你启用自动签到" );
} )
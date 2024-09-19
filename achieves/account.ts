import { defineDirective, InputParameter } from "@/modules/command";
import { Account } from "#/mihoyo-sign/module/account";

export default defineDirective( "order", async ( i: InputParameter ) => {
	const accounts = await new Account().getAccounts( i );
	const message = accounts.map( ( item, index, _ ) => `${ index + 1 }. UID${ item.uid }` ).join( "\n" );
	await i.sendMessage( [ "以下为你绑定的米游社账号（UID为米游社ID）\n", message ] );
} )
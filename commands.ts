import { ConfigType, OrderConfig } from "@/modules/command";
import { MessageScope } from "@/modules/message";
import { AuthLevel } from "@/modules/management/auth";

const sign: OrderConfig = {
	type: "order",
	headers: [ "sign", "米游社签到" ],
	cmdKey: "miHoYo-sign.sign",
	desc: [ "米游社签到", "(账户序号)" ],
	regexps: [ "(\\d+)?" ],
	scope: MessageScope.Both,
	auth: AuthLevel.User,
	main: "achieves/sign",
	detail: "米游社游戏签到和米游币签到，默认签到全部账号。"
};

const get_account: OrderConfig = {
	type: "order",
	headers: [ "我的米游社账号", "mia" ],
	cmdKey: "miHoYo-sign.get-account",
	desc: [ "查看绑定的米游社账号", "" ],
	regexps: [ "" ],
	scope: MessageScope.Private,
	auth: AuthLevel.User,
	main: "achieves/account",
	detail: "查看我绑定的米游社账户，根据此指令返回的序号进行单个账号签到。"
}

export default <ConfigType[]>[ sign, get_account ];
/**
 * @desc 米游社游戏签到信息
 * @interface GameSignInfo
 * @property {boolean} is_sign 今天是否签到
 * @property {string} today 今日日期
 * @property {number} total_sign_day 本月累计签到天数
 * @property {number} sign_cnt_missed 漏签次数
 * @property {string} region 服务区域（当前为空）
 * @property {number} short_sign_day 活动签到
 * @property {boolean} send_first 是否初次签到
 */
type GameSignInfo = {
	is_sign: boolean;
	today: string;
	is_sub: boolean;
	total_sign_day: number;
	sign_cnt_missed: number;
	region: string;
	short_sign_day: number;
	send_first: boolean;
}

/**
 * @desc 米游社游戏签到响应数据
 * @interface GameSignIn
 * @property {string} code 米游社游戏签到请求返回的code
 * @property {number} risk_code 风控验证码
 * @property {string} gt 极验账号ID
 * @property {string} challenge 验证请求的流水号
 * @property {number} success 签到成功与否
 */
type GameSignIn = {
	code: string;
	risk_code: number;
	gt: string;
	challenge: string;
	success: number;
}

/**
 * @desc 米游社游戏签到奖励信息
 * @interface GameSignInReward
 * @property {string} name 奖励名称
 * @property {string} icon 奖励图标
 * @property {number} cnt 奖励数量
 */
type Award = {
	name: string;
	icon: string;
	cnt: number;
	id?: number;
	sign_day?: number;
}

/**
 * @desc 额外的奖励
 * @interface ExtraAward
 * @property {boolean} has_extra_award 是否有额外奖励
 * @property {string} start_time 开始时间
 * @property {string} end_time 结束时间
 * @property {Award} list 奖励数组
 * @property {string} start_timestamp 开始时间戳
 * @property {string} end_timestamp 结束时间戳
 */
type ExtraAward = {
	has_extra_award: boolean;
	start_time: string;
	end_time: string;
	list: Award[];
	start_timestamp: string;
	end_timestamp: string;
}

/**
 * @desc 游戏签到奖励
 * @interface GameSignInReward
 * @property {number} month 签到月份
 * @property {Award[]} awards 奖励数组
 * @property {string} biz 所在服务器
 * @property {boolean} resign 是否重签到
 * @property {ExtraAward} short_extra_award 额外签到奖励
 */
type GameSignInReward = {
	month: number;
	awards: Award[];
	biz: string;
	resign: boolean;
	short_extra_award: ExtraAward;
}

type GameSignInResult = GameSignInfo & Partial<Award> & {
	has_extra_award?: boolean;
	extra_reward?: Award;
};
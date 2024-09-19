export type GeetestConfig = {
	gt: string;
	challenge: string;
	mmt_key?: string;
	new_captcha?: boolean;
	risk_type?: string;
	success?: number;
	use_v4?: boolean;
}


export type GeetestValidate = {
	geetest_challenge: string;
	geetest_validate: string;
	geetest_seccode?: string;
}
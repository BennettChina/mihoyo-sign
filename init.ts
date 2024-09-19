import { definePlugin } from "@/modules/plugin";
import cfgList from "./commands";
import routers from "./routes";
import { Renderer } from "@/modules/renderer";

export let config: typeof initConfig;
export let renderer: Renderer;

const initConfig = {
	captcha: {
		viewUrl: "https://captcha.javas.dev/manual/captcha",
		apiUrl: "https://tools.javas.dev/api/manual/captcha",
		auto: {
			enabled: false,
			api: "",
			params: {
				token: ""
			},
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			response: {
				codeFieldName: "code",
				messageFieldName: "message",
				dataFieldName: "data",
				validateFieldName: "validate",
				successCode: "0"
			}
		}
	},
	alias: [ "米游社签到" ]
}

export default definePlugin( {
	name: "miHoYo签到插件",
	cfgList,
	server: {
		routers
	},
	publicDirs: [ "assets", "views", "components" ],
	repo: {
		owner: "BennettChina",
		repoName: "mihoyo-sign",
		ref: "master"
	},
	async mounted( params ) {
		const _config = params.configRegister( "main", initConfig );
		_config.on( "refresh", ( newCfg ) => {
			params.setAlias( newCfg.alias );
		} );
		params.setAlias( _config.alias );
		config = _config;
		/* 实例化渲染器 */
		renderer = params.renderRegister( "#app", "views" );
	}
} )
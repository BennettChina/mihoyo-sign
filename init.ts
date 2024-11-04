import { definePlugin } from "@/modules/plugin";
import cfgList from "./commands";
import routers from "./routes";
import { Renderer } from "@/modules/renderer";
import { Task } from "#/mihoyo-sign/module/task";

export let config: typeof initConfig;
export let renderer: Renderer;
let task: Task;

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
	cron: "0 30 8 * * *",
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
	subscribe: [ {
		name: "自动签到",
		async getUser( { redis } ) {
			const dbKey = `adachi.miHoYo.auto-sign-in`;
			const autoList = await redis.getList( dbKey );
			return {
				person: autoList.map( item => parseInt( item ) )
			};
		},
		async reSub( userId, type, { redis } ) {
			if ( type === 'private' ) {
				const dbKey = `adachi.miHoYo.auto-sign-in`;
				await redis.delListElement( dbKey, `${ userId }` );
			}
		}
	} ],
	async mounted( params ) {
		const _config = params.configRegister( "main", initConfig );
		_config.on( "refresh", ( newCfg ) => {
			params.setAlias( newCfg.alias );
			if ( task ) {
				task.cancel( newCfg.captcha.auto.enabled );
			} else if ( newCfg.captcha.auto.enabled ) {
				task = new Task();
			}
		} );
		params.setAlias( _config.alias );
		config = _config;
		/* 实例化渲染器 */
		renderer = params.renderRegister( "#app", "views" );
		
		// 启用自动签到
		if ( config.captcha.auto.enabled ) {
			task = new Task();
		}
	},
	async unmounted( _params ) {
		task && task.cancel();
	}
} )
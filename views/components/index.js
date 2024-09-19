const template = `<CommonBase v-if="data" class="common" title="米游社签到结果">
	<CommonCard
		v-for="(item, index) in data"
		:key="index"
		class="cmd-list"
		:title="item.title"
	>
		<template v-if="index===0">
			<game :data="item.data"/>
		</template>
		<template v-else>
			<community :data="item.data"/>
		</template>
	</CommonCard>
</CommonBase>`;


import { defineComponent, onMounted, reactive } from "vue";
import { urlParamsGet } from "../../assets/js/url.js";
import CommonBase from "../../components/common/components/CommonBase.js";
import CommonCard from "../../components/common/components/CommonCard.js";
import Game from "../../components/game/index.js";
import Community from "../../components/community/index.js";

export default defineComponent( {
	name: 'MiHoYoSign',
	template,
	components: {
		CommonBase,
		CommonCard,
		Game,
		Community
	},
	setup() {
		const urlParams = urlParamsGet( location.href );
		const qq = urlParams.qq;
		const data = reactive( [
			{
				title: "米游社游戏签到",
				data: []
			},
			{
				title: "米游社社区签到",
				data: []
			}
		] );
		
		
		const getData = async () => {
			const resp = await fetch( `/mihoyo-sign/api/signin?qq=${ qq }` ).then( res => {
				return res.json();
			} );
			data[0].data = resp.map( item => {
				return {
					uid: item.uid,
					games: item.games
				}
			} )
			data[1].data = resp.map( item => {
				return {
					uid: item.uid,
					community: item.community
				}
			} )
		};
		
		onMounted( getData );
		
		return {
			data,
		}
	}
} )
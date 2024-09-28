const template = `
<table>
  <thead>
    <tr>
      <th scope="col">UID</th>
      <th scope="col">游戏</th>
      <th scope="col">签到结果</th>
      <th scope="col">签到奖励</th>
      <th scope="col">累签</th>
      <th scope="col">本月漏签</th>
      <th scope="col">备注</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="({game, result}, idx) in games" :key="idx">
      <th scope="row">{{game.uid}}</th>
      <th scope="row">{{game.gameName}}</th>
      <th scope="row">{{signResult(result.is_sign)}}</th>
      <th scope="row">
      	<div v-if="result.is_sign" class="reward-main">
	        <div class="reward">
		        <img :src="result.icon" alt="icon" class="icon"/>
		        <div>{{result.name}}*{{result.cnt}}</div>
			</div>
	        <div v-if="result.has_extra_award" class="reward">
	            <img :src="result.extra_reward.icon" alt="extra-icon" class="icon"/>
	            <div>{{result.extra_reward.name}}*{{result.extra_reward.cnt}}(活动)</div>
			</div>
		</div>
	  </th>
      <th scope="row">{{result.total_sign_day}}</th>
      <th scope="row">{{result.sign_cnt_missed}}</th>
      <th scope="row">{{result.reason}}</th>
    </tr>
  </tbody>
</table>
`;

import { computed, defineComponent } from "vue";

export default defineComponent( {
	name: 'Game',
	template,
	props: {
		data: Array
	},
	setup( props ) {
		const games = computed( () => {
			const data = [];
			props.data.forEach( ( item ) => {
				data.push( ...item.games );
			} )
			return data;
		} )
		
		const signResult = ( param ) => {
			return param === "true" ? "签到成功" : "签到失败";
		}
		
		return {
			games,
			signResult
		};
	}
} )
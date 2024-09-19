/**
 * 基础卡片组件
 * @author AsukaMari
 * @date 2024-09-17
 * @licence MIT
 */
const template = `<div class="common-card">
	<div class="common-card-header">
		<p>{{ title }}</p>
	</div>
	<div class="common-card-container">
		<slot />
	</div>
</div>`;

export default {
	name: "CommonCard",
	template,
	props: {
		title: {
			type: String,
			default: "小标题"
		}
	},
	setup() {
	
	}
}
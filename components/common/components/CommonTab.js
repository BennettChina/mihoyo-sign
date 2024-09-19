/**
 * 基础小标签组件
 * @author AsukaMari
 * @date 2024-09-17
 * @licence MIT
 */
const template = `<div class="common-tab">
	<p v-if="mark" class="common-tab-mark">{{ mark }}</p>
	<p class="common-tab-index">{{ index }}</p>
	<slot></slot>
</div>`;

export default {
	name: "CommonTab",
	template,
	props: {
		index: {
			type: String,
			default: "1"
		},
		mark: {
			type: String,
			default: ""
		}
	},
}
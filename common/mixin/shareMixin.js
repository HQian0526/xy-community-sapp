import { resolveShareConfig } from '@/common/share/config.js'

export default {
	data() {
		return {
			shareConfig: null
		}
	},
	// #ifdef MP-WEIXIN
	onShareAppMessage() {
		return resolveShareConfig(this.shareConfig || {})
	},
	// #endif
	methods: {
		getShareConfig(customConfig = {}) {
			return resolveShareConfig({
				...(this.shareConfig || {}),
				...customConfig
			})
		}
	}
}

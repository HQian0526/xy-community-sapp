import { resolveShareConfig } from '@/common/share/config.js'

export default {
	data() {
		return {
			shareConfig: null
		}
	},
	// #ifdef MP-WEIXIN
	onShareAppMessage() {
		// 页面可通过 buildShareConfig() 动态生成分享内容（如商品详情页分享当前商品），
		// 未提供时回退到静态 shareConfig / 当前店铺首页。
		const dynamic = typeof this.buildShareConfig === 'function'
			? this.buildShareConfig()
			: null
		return resolveShareConfig(dynamic || this.shareConfig || {})
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

/**
 * 页面 onShow 时重新注册手机号弹窗，避免 tab 切换后注册丢失
 * 页面需放置 <bind-phone-popup ref="bindPhonePopup" />
 */
export default {
	onShow() {
		this.$nextTick(() => {
			const popup = this.$refs.bindPhonePopup
			if (popup && typeof popup.activate === 'function') {
				popup.activate()
			}
		})
	},
	onHide() {
		const popup = this.$refs.bindPhonePopup
		if (popup && typeof popup.deactivate === 'function') {
			popup.deactivate()
		}
	}
}

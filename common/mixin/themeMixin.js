import { applyNativeChrome, getTheme, onThemeChange, themeCssVars } from '@/common/theme.js'

export default {
	data() {
		return {
			themeTick: 0
		}
	},
	computed: {
		themePrimary() {
			this.themeTick
			return getTheme().primary
		},
		themeCssVars() {
			this.themeTick
			return themeCssVars(getTheme())
		}
	},
	created() {
		this._offTheme = onThemeChange(() => {
			this.themeTick += 1
		})
	},
	beforeDestroy() {
		if (this._offTheme) this._offTheme()
	},
	unmounted() {
		if (this._offTheme) this._offTheme()
	},
	onShow() {
		applyNativeChrome()
		this.themeTick += 1
	}
}

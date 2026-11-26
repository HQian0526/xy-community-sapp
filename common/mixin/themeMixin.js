import { applyNativeChrome, getTheme, onThemeChange, themeCssVars } from '@/common/theme.js'
import { bumpAppChrome, syncTabFromRoute } from '@/common/appChrome.js'

function readCurrentRoute() {
	try {
		const pages = getCurrentPages()
		const cur = pages && pages[pages.length - 1]
		return (cur && cur.route) || ''
	} catch (e) {
		return ''
	}
}

export default {
	data() {
		return {
			themeTick: 0,
			xyRouteBox: { route: '' }
		}
	},
	provide() {
		return {
			xyOwnerRouteState: this.xyRouteBox
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
	onLoad() {
		this.captureXyRoute()
	},
	onShow() {
		this.captureXyRoute()
		applyNativeChrome()
		syncTabFromRoute()
		bumpAppChrome()
		this.themeTick += 1
	},
	methods: {
		captureXyRoute() {
			const route = readCurrentRoute()
			if (!route || !this.xyRouteBox || this.xyRouteBox.route === route) return
			this.xyRouteBox.route = route
		}
	}
}

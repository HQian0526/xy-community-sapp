<template>
	<up-navbar
		v-if="isCurrentPage"
		:title="resolvedTitle"
		:bgColor="theme.primary"
		:titleColor="theme.onPrimary"
		:leftIcon="showBack ? 'arrow-left' : ''"
		:leftIconColor="theme.onPrimary"
		:placeholder="true"
		:fixed="true"
		:safeAreaInsetTop="true"
		:border="false"
		:autoBack="false"
		titleWidth="360rpx"
		@leftClick="onBack"
	/>
</template>

<script>
	import { getTheme, onThemeChange } from '@/common/theme.js'
	import { getMiniappUi } from '@/common/miniappUi.js'
	import {
		currentPageRoute,
		isTabRoute,
		normalizeRoute,
		onAppChrome,
		titleByRoute
	} from '@/common/appChrome.js'
	import uNavbar from '@/uni_modules/uview-plus/components/u-navbar/u-navbar.vue'

	export default {
		name: 'xy-navbar',
		components: {
			'up-navbar': uNavbar
		},
		inject: {
			xyOwnerRouteState: { default: null }
		},
		props: {
			title: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				themeTick: 0,
				chromeTick: 0
			}
		},
		computed: {
			theme() {
				this.themeTick
				return getTheme()
			},
			route() {
				this.chromeTick
				const state = this.xyOwnerRouteState
				const owned = state && state.route
				return normalizeRoute(owned || currentPageRoute())
			},
			isCurrentPage() {
				this.chromeTick
				const state = this.xyOwnerRouteState
				const owned = normalizeRoute(state && state.route)
				const current = normalizeRoute(currentPageRoute())
				if (!owned || !current) return true
				return owned === current
			},
			showBack() {
				return !isTabRoute(this.route)
			},
			resolvedTitle() {
				this.chromeTick
				if (this.title) return this.title
				const route = this.route
				const mapped = titleByRoute(route)
				if (mapped) return mapped
				if (normalizeRoute(route) === 'pages/mall/index') {
					return getMiniappUi().homeTabText || '逛店'
				}
				return ''
			}
		},
		created() {
			this._offTheme = onThemeChange(() => {
				this.themeTick += 1
			})
			this._offChrome = onAppChrome(() => {
				this.chromeTick += 1
			})
		},
		beforeDestroy() {
			this.unbind()
		},
		unmounted() {
			this.unbind()
		},
		methods: {
			unbind() {
				if (this._offTheme) this._offTheme()
				if (this._offChrome) this._offChrome()
				this._offTheme = null
				this._offChrome = null
			},
			onBack() {
				if (!this.showBack) return
				const pages = getCurrentPages()
				if (pages && pages.length > 1) {
					uni.navigateBack({ fail: () => this.goHome() })
					return
				}
				this.goHome()
			},
			goHome() {
				uni.switchTab({
					url: '/pages/mall/index',
					fail() {}
				})
			}
		}
	}
</script>

<template>
	<up-tabbar
		:value="selected"
		:activeColor="theme.primary"
		inactiveColor="#7A7E83"
		:border="true"
		:fixed="true"
		:placeholder="true"
		:safeAreaInsetBottom="true"
		zIndex="900"
		@change="onChange"
	>
		<up-tabbar-item
			v-for="item in tabs"
			:key="item.name"
			:name="item.name"
			:text="item.name === 'mall' ? homeTabText : item.text"
			:icon="item.icon"
			:activeIcon="item.activeIcon"
		/>
	</up-tabbar>
</template>

<script>
	import { getTheme, onThemeChange } from '@/common/theme.js'
	import { getMiniappUi } from '@/common/miniappUi.js'
	import {
		getAppChrome,
		onAppChrome,
		setTabSelected,
		TAB_LIST
	} from '@/common/appChrome.js'
	import uTabbar from '@/uni_modules/uview-plus/components/u-tabbar/u-tabbar.vue'
	import uTabbarItem from '@/uni_modules/uview-plus/components/u-tabbar-item/u-tabbar-item.vue'

	export default {
		name: 'xy-tabbar',
		components: {
			'up-tabbar': uTabbar,
			'up-tabbar-item': uTabbarItem
		},
		data() {
			return {
				themeTick: 0,
				chromeTick: 0,
				tabs: TAB_LIST
			}
		},
		computed: {
			theme() {
				this.themeTick
				return getTheme()
			},
			selected() {
				this.chromeTick
				return getAppChrome().selected
			},
			homeTabText() {
				this.chromeTick
				return getAppChrome().homeTabText || getMiniappUi().homeTabText || '逛店'
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
			onChange(name) {
				const item = TAB_LIST.find((tab) => tab.name === name)
				if (!item) return
				setTabSelected(item.name)
				uni.switchTab({
					url: item.path,
					fail() {}
				})
			}
		}
	}
</script>

/** 小程序预置主题。主色只换品牌色，成功/警告/错误语义色不跟主题绑死。 */

export const DEFAULT_THEME_CODE = 'teal'

export const THEME_PRESETS = {
	teal: {
		code: 'teal',
		name: '青柠',
		hint: '通用、茶饮、生鲜',
		primary: '#00a896',
		primaryDark: '#008f7f',
		primaryLight: '#e5f7f4',
		onPrimary: '#ffffff'
	},
	orange: {
		code: 'orange',
		name: '暖橙',
		hint: '美业、烘焙、轻食',
		primary: '#e67e22',
		primaryDark: '#c96a16',
		primaryLight: '#fdebd8',
		onPrimary: '#ffffff'
	},
	red: {
		code: 'red',
		name: '朱红',
		hint: '餐饮、零售',
		primary: '#c94c4c',
		primaryDark: '#a83e3e',
		primaryLight: '#fdeaea',
		onPrimary: '#ffffff'
	},
	blue: {
		code: 'blue',
		name: '晴空',
		hint: '社区、预约、服务',
		primary: '#2f7dd1',
		primaryDark: '#2566b0',
		primaryLight: '#e6f1fb',
		onPrimary: '#ffffff'
	},
	coffee: {
		code: 'coffee',
		name: '岩茶',
		hint: '咖啡、中式、轻奢',
		primary: '#7a5c4a',
		primaryDark: '#634a3c',
		primaryLight: '#f3ece7',
		onPrimary: '#ffffff'
	}
}

const TAB_ACTIVE_ICONS = [
	{ index: 0, file: 'tarbar2-active.png' },
	{ index: 1, file: 'tarbar4-active.png' },
	{ index: 2, file: 'tarbar1-active.png' },
	{ index: 3, file: 'tarbar3-active.png' }
]

let current = THEME_PRESETS[DEFAULT_THEME_CODE]
let appliedCode = ''
const listeners = []

export function normalizeThemeCode(code) {
	const key = String(code || '').trim().toLowerCase()
	return THEME_PRESETS[key] ? key : DEFAULT_THEME_CODE
}

export function getThemeByCode(code) {
	return THEME_PRESETS[normalizeThemeCode(code)]
}

export function getTheme() {
	return current
}

export function themeCssVars(theme = current) {
	const t = theme || current
	return {
		'--xy-primary': t.primary,
		'--xy-primary-dark': t.primaryDark,
		'--xy-primary-light': t.primaryLight,
		'--xy-on-primary': t.onPrimary
	}
}

export function onThemeChange(fn) {
	if (typeof fn !== 'function') {
		return () => {}
	}
	listeners.push(fn)
	return () => {
		const i = listeners.indexOf(fn)
		if (i >= 0) listeners.splice(i, 1)
	}
}

function notify() {
	listeners.forEach((fn) => {
		try {
			fn(current)
		} catch (e) {
			console.error('theme listener', e)
		}
	})
}

function applyTabBar(theme) {
	uni.setTabBarStyle({
		selectedColor: theme.primary,
		fail() {}
	})
	TAB_ACTIVE_ICONS.forEach((item) => {
		uni.setTabBarItem({
			index: item.index,
			selectedIconPath: `/static/tarbar/themes/${theme.code}/${item.file}`,
			fail() {}
		})
	})
}

function applyNavBar(theme) {
	uni.setNavigationBarColor({
		frontColor: '#ffffff',
		backgroundColor: theme.primary,
		animation: {
			duration: 0,
			timingFunc: 'linear'
		},
		fail() {}
	})
}

/**
 * 顶栏、Tab 文字色和图标。
 * 微信每次切 Tab 都会把底栏/顶栏打回 pages.json 的青绿，所以每次 onShow 都要重刷，不能因为主题没变就跳过。
 */
export function applyNativeChrome(theme = current) {
	const next = theme || current
	appliedCode = next.code
	applyNavBar(next)
	applyTabBar(next)
}

export function applyTheme(code, options = {}) {
	const next = getThemeByCode(code)
	const changed = current.code !== next.code
	current = next
	applyNativeChrome(next)
	if (changed) {
		notify()
	}
	return current
}

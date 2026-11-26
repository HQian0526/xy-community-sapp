/** 小程序预置主题。主色只换品牌色，成功/警告/错误语义色不跟主题绑死。 */

export const DEFAULT_THEME_CODE = 'teal'
const THEME_STORAGE_KEY = 'xy_theme_v1'

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
	apricot: {
		code: 'apricot',
		name: '暖橘',
		hint: '宠物、烘焙、轻食',
		primary: '#e07a3d',
		primaryDark: '#b86432',
		primaryLight: '#fbefe8',
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

export function parseHexColor(input) {
	const raw = String(input || '').trim().toLowerCase()
	if (/^#?[0-9a-f]{3}$/.test(raw)) {
		const h = raw.replace('#', '')
		return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`
	}
	if (/^#?[0-9a-f]{6}$/.test(raw)) {
		return `#${raw.replace('#', '')}`
	}
	return ''
}

function hexToRgb(hex) {
	const h = hex.replace('#', '')
	return [
		parseInt(h.slice(0, 2), 16),
		parseInt(h.slice(2, 4), 16),
		parseInt(h.slice(4, 6), 16)
	]
}

function toHex(n) {
	const v = Math.max(0, Math.min(255, Math.round(n)))
	return v.toString(16).padStart(2, '0')
}

function rgbToHex(r, g, b) {
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function mixWhite(r, g, b, amount) {
	return rgbToHex(
		r + (255 - r) * amount,
		g + (255 - g) * amount,
		b + (255 - b) * amount
	)
}

function luminance(r, g, b) {
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export function buildThemeFromPrimary(primary, code) {
	let hex = parseHexColor(primary) || THEME_PRESETS[DEFAULT_THEME_CODE].primary
	let [r, g, b] = hexToRgb(hex)
	if (luminance(r, g, b) > 0.86) {
		r *= 0.72
		g *= 0.72
		b *= 0.72
		hex = rgbToHex(r, g, b)
	}
	const onPrimary = luminance(r, g, b) > 0.62 ? '#1c2b28' : '#ffffff'
	return {
		code: code || hex,
		name: '自定义',
		hint: hex,
		primary: hex,
		primaryDark: rgbToHex(r * 0.82, g * 0.82, b * 0.82),
		primaryLight: mixWhite(r, g, b, 0.88),
		onPrimary
	}
}

function readCachedTheme() {
	try {
		const raw = uni.getStorageSync(THEME_STORAGE_KEY)
		if (!raw) return null
		const obj = typeof raw === 'string' ? JSON.parse(raw) : raw
		const code = obj && (obj.code || obj.primary)
		if (!code) return null
		return getThemeByCode(code)
	} catch (e) {
		return null
	}
}

function persist(theme) {
	try {
		uni.setStorageSync(THEME_STORAGE_KEY, {
			code: theme.code,
			primary: theme.primary
		})
	} catch (e) {}
}

let current = readCachedTheme() || THEME_PRESETS[DEFAULT_THEME_CODE]
const listeners = []

export function normalizeThemeCode(code) {
	const key = String(code || '').trim().toLowerCase()
	if (THEME_PRESETS[key]) return key
	return parseHexColor(key) || DEFAULT_THEME_CODE
}

export function getThemeByCode(code) {
	const key = normalizeThemeCode(code)
	if (THEME_PRESETS[key]) return THEME_PRESETS[key]
	return buildThemeFromPrimary(key, key)
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

function themeKey(theme) {
	return `${theme.code}|${theme.primary}`
}

/**
 * 状态栏 / 胶囊前景色。顶栏底栏已改为自绘，不再 setTabBarItem。
 */
export function applyNativeChrome(theme = current) {
	const next = theme || current
	uni.setNavigationBarColor({
		frontColor: next.onPrimary === '#ffffff' ? '#ffffff' : '#000000',
		backgroundColor: next.primary,
		animation: {
			duration: 0,
			timingFunc: 'linear'
		},
		fail() {}
	})
}

export function applyTheme(code, options = {}) {
	const next = getThemeByCode(code)
	const changed = themeKey(current) !== themeKey(next)
	current = next
	persist(next)
	applyNativeChrome(next)
	if (changed || options.force) {
		notify()
	}
	return current
}

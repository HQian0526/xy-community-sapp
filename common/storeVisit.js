import {
	bindStoreId as defaultBindStoreId
} from '@/config/index.js'

const IDENTITY_MERCHANT = 2

/** 本次启动由扫码 / onLoad 带入的店铺，只放内存，杀进程后失效 */
let entryStoreId = ''
/** 当前登录商家自己的店铺，用于判断是不是在逛别人的店 */
let ownMerchantStoreId = ''

export function isBlankStoreId(value) {
	return value === undefined || value === null || String(value).trim() === ''
}

export function normalizeStoreId(value) {
	if (isBlankStoreId(value)) return ''
	return String(value).trim()
}

function fullyDecode(value) {
	if (value === undefined || value === null) return ''
	let text = String(value).replace(/\+/g, ' ')
	for (let i = 0; i < 3; i++) {
		try {
			const next = decodeURIComponent(text)
			if (next === text) break
			text = next
		} catch (e) {
			break
		}
	}
	return text
}

/** 微信启动 scene（1011/1047 等）是 4 位数字，不能当成店铺 id */
function isWeChatLaunchScene(value) {
	const text = String(value == null ? '' : value).trim()
	return /^\d{4}$/.test(text)
}

function pickStoreIdFromText(text) {
	const decoded = fullyDecode(text)
	if (!decoded) return ''
	const named = decoded.match(/[?&#]?storeId=([^&/#?]+)/i)
	if (named) return normalizeStoreId(fullyDecode(named[1]))
	const encoded = decoded.match(/storeId%3D([^%&#/]+)/i)
	if (encoded) return normalizeStoreId(fullyDecode(encoded[1]))
	return ''
}

function parseStoreIdFromUrl(url) {
	if (!url) return ''
	const fromText = pickStoreIdFromText(url)
	if (fromText) return fromText
	const decoded = fullyDecode(url)
	try {
		if (typeof URL === 'function') {
			const parsed = new URL(decoded)
			const id = parsed.searchParams.get('storeId')
			if (id) return normalizeStoreId(id)
		}
	} catch (e) {
		// 小程序环境可能没有 URL，走上面的正则即可
	}
	return ''
}

function parseStoreIdFromScene(scene) {
	const text = fullyDecode(scene).trim()
	if (!text) return ''
	if (isWeChatLaunchScene(text)) return ''
	const named = pickStoreIdFromText(text)
	if (named) return named
	if (/^\d{5,}$/.test(text)) return text
	return ''
}

/**
 * 从页面 onLoad / App 启动参数里取出店铺 id。
 * 兼容 ?storeId=、普通链接二维码 q、小程序码 scene。
 */
export function parseStoreIdFromQuery(query = {}) {
	if (!query || typeof query !== 'object') return ''
	if (!isBlankStoreId(query.storeId)) {
		return normalizeStoreId(query.storeId)
	}
	if (query.q) {
		const fromUrl = parseStoreIdFromUrl(query.q)
		if (fromUrl) return fromUrl
	}
	if (query.scene) {
		const fromScene = parseStoreIdFromScene(query.scene)
		if (fromScene) return fromScene
	}
	return ''
}

function pushQueryBag(bags, obj) {
	if (!obj || typeof obj !== 'object') return
	if (obj.query && typeof obj.query === 'object') {
		bags.push(obj.query)
	}
	bags.push(obj)
}

/** 冷启动 / 热启动扫码后，从微信运行时再取一遍参数（tabBar 页 onLoad 经常拿不到） */
export function collectEnterQuery() {
	const bags = []
	try {
		if (typeof uni !== 'undefined') {
			if (typeof uni.getEnterOptionsSync === 'function') {
				pushQueryBag(bags, uni.getEnterOptionsSync())
			}
			if (typeof uni.getLaunchOptionsSync === 'function') {
				pushQueryBag(bags, uni.getLaunchOptionsSync())
			}
		}
	} catch (e) {
		// ignore
	}
	try {
		if (typeof wx !== 'undefined') {
			if (typeof wx.getEnterOptionsSync === 'function') {
				pushQueryBag(bags, wx.getEnterOptionsSync())
			}
			if (typeof wx.getLaunchOptionsSync === 'function') {
				pushQueryBag(bags, wx.getLaunchOptionsSync())
			}
		}
	} catch (e) {
		// ignore
	}
	return bags
}

/** 商家主动切回自己的店后，忽略本次扫码带来的 entry，直到下一次真正扫码 */
let lockOwnStore = false

const SCAN_LAUNCH_SCENES = [1011, 1012, 1013, 1025, 1047, 1048, 1049, 1124]

function parseWxLaunchScene(input) {
	if (!input || typeof input !== 'object') return 0
	const raw = input.scene
	const n = Number(raw)
	return Number.isFinite(n) ? n : 0
}

function parseIdFromInput(input) {
	if (!input || typeof input !== 'object') return ''
	if (input.query && typeof input.query === 'object') {
		const fromQuery = parseStoreIdFromQuery(input.query)
		if (fromQuery) return fromQuery
	}
	return parseStoreIdFromQuery(input)
}

export function getEntryStoreId() {
	return entryStoreId
}

export function setEntryStoreId(id) {
	const next = normalizeStoreId(id)
	if (next) {
		entryStoreId = next
		lockOwnStore = false
	}
	return entryStoreId
}

export function clearEntryStoreId() {
	entryStoreId = ''
	return entryStoreId
}

/** 商家从别人店切回自己的店：清掉扫码进店状态 */
export function switchToOwnStore() {
	entryStoreId = ''
	lockOwnStore = true
	return getOwnMerchantStoreId()
}

export function applyLaunchQuery(query, meta = {}) {
	const explicitId = parseIdFromInput(query)
	if (lockOwnStore) {
		const wxScene = parseWxLaunchScene(query)
		const fromAppShow = meta.source === 'appShow'
		const isScanEnter = fromAppShow && SCAN_LAUNCH_SCENES.indexOf(wxScene) !== -1
		if (explicitId && isScanEnter) {
			lockOwnStore = false
			setEntryStoreId(explicitId)
			return explicitId
		}
		return ''
	}
	if (explicitId) {
		setEntryStoreId(explicitId)
		return explicitId
	}
	const bags = collectEnterQuery()
	for (let i = 0; i < bags.length; i++) {
		const id = parseStoreIdFromQuery(bags[i])
		if (id) {
			setEntryStoreId(id)
			return id
		}
	}
	return ''
}

export function setOwnMerchantStoreId(id) {
	ownMerchantStoreId = normalizeStoreId(id)
	return ownMerchantStoreId
}

export function getOwnMerchantStoreId() {
	return ownMerchantStoreId
}

/**
 * 逛店 / 其他业务用的店铺：扫码入参 > 用户 bindStoreId > 项目默认店铺
 */
export function resolveViewStoreId(user) {
	const entry = getEntryStoreId()
	if (entry) return entry
	if (user && Number(user.identityType) === IDENTITY_MERCHANT) {
		const own = getOwnMerchantStoreId() || normalizeStoreId(user.bindStoreId)
		if (own) return own
	}
	const bound = user && user.bindStoreId
	if (!isBlankStoreId(bound)) return normalizeStoreId(bound)
	return String(defaultBindStoreId)
}

/**
 * 商家扫了别人店的码：其他业务、我的按普通用户界面展示
 */
export function shouldForceOrdinaryUi(user) {
	if (!user || Number(user.identityType) !== IDENTITY_MERCHANT) {
		return false
	}
	const entry = getEntryStoreId()
	if (!entry) return false
	const own = getOwnMerchantStoreId() || normalizeStoreId(user.bindStoreId)
	if (!own) return false
	return own !== entry
}

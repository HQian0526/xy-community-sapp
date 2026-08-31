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

function safeDecode(value) {
	if (value === undefined || value === null) return ''
	const raw = String(value)
	try {
		return decodeURIComponent(raw)
	} catch (e) {
		return raw
	}
}

function parseStoreIdFromUrl(url) {
	if (!url) return ''
	const text = String(url)
	try {
		const parsed = new URL(text)
		const id = parsed.searchParams.get('storeId')
		if (id) return normalizeStoreId(id)
	} catch (e) {
		const matched = text.match(/[?&]storeId=([^&]+)/i)
		if (matched) return normalizeStoreId(safeDecode(matched[1]))
	}
	return ''
}

function parseStoreIdFromScene(scene) {
	const text = safeDecode(scene).trim()
	if (!text) return ''
	if (/storeId=/i.test(text)) {
		const matched = text.match(/storeId=([^&]+)/i)
		if (matched) return normalizeStoreId(safeDecode(matched[1]))
	}
	if (/^\d+$/.test(text)) return text
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
		const fromUrl = parseStoreIdFromUrl(safeDecode(query.q))
		if (fromUrl) return fromUrl
	}
	if (query.scene) {
		const fromScene = parseStoreIdFromScene(query.scene)
		if (fromScene) return fromScene
	}
	return ''
}

export function getEntryStoreId() {
	return entryStoreId
}

export function setEntryStoreId(id) {
	const next = normalizeStoreId(id)
	if (next) {
		entryStoreId = next
	}
	return entryStoreId
}

export function applyLaunchQuery(query) {
	const id = parseStoreIdFromQuery(query || {})
	if (id) setEntryStoreId(id)
	return id
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

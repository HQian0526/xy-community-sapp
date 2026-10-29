import {
	bindStoreId as defaultBindStoreId,
	lockStoreId
} from '@/config/index.js'

const IDENTITY_MERCHANT = 2
const REMEMBERED_STORE_KEY = 'lastViewStoreId'

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

/** 已处理过的进入标识（scene + storeId），避免热启动回前台时重复套用同一个分享/扫码店铺 */
let appliedEntryKey = ''

/** 商家主动切回自己的店后，忽略本次扫码带来的 entry，直到下一次真正扫码 */
let lockOwnStore = false

const SCAN_LAUNCH_SCENES = [1011, 1012, 1013, 1025, 1047, 1048, 1049, 1124]

/**
 * 分享卡片进入的 scene：
 * 1007 单人聊天消息卡片、1008 群聊消息卡片、1044 带 shareTicket 的群聊卡片、
 * 1036 App 分享的消息卡片、1090 右上角菜单转发。这些渠道同样应尊重分享带来的店铺。
 */
const SHARE_LAUNCH_SCENES = [1007, 1008, 1036, 1044, 1090]

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

export function getRememberedStoreId() {
	try {
		return normalizeStoreId(uni.getStorageSync(REMEMBERED_STORE_KEY))
	} catch (e) {
		return ''
	}
}

export function rememberViewStoreId(id) {
	const next = normalizeStoreId(id)
	if (!next || lockStoreId) return ''
	try {
		uni.setStorageSync(REMEMBERED_STORE_KEY, next)
	} catch (e) {
		// ignore
	}
	return next
}

export function setEntryStoreId(id) {
	const next = normalizeStoreId(id)
	if (next) {
		entryStoreId = next
		lockOwnStore = false
		rememberViewStoreId(next)
	}
	return entryStoreId
}

export function clearEntryStoreId() {
	entryStoreId = ''
	return entryStoreId
}

/** 商家/员工从别人店切回自己的店：清掉扫码进店状态 */
export function switchToOwnStore(user) {
	entryStoreId = ''
	lockOwnStore = true
	// 清掉进入记录，保证之后再点同一张分享卡片仍能进入分享的店铺
	appliedEntryKey = ''
	const own = getWorkplaceStoreId(user)
	if (own) {
		setOwnMerchantStoreId(own)
		rememberViewStoreId(own)
	}
	return own
}

/** 生成一次进入的唯一标识 */
function entryKeyOf(scene, storeId) {
	return `${scene || 0}:${normalizeStoreId(storeId)}`
}

/**
 * 处理小程序启动/回前台带来的店铺参数。
 *
 * 优先级：扫码、分享卡片这类「用户主动带来的店铺」> 商家「切回自己店」的锁定（lockOwnStore）。
 * 也就是：商家即使刚切回自己的店，只要点开别人分享的卡片，仍应进入分享的店铺，
 * 之后可在「我的」页通过「切换至我的店铺」回到自家店。
 */
export function applyLaunchQuery(query, meta = {}) {
	if (lockStoreId) {
		return ''
	}
	const explicitId = parseIdFromInput(query)
	const wxScene = parseWxLaunchScene(query)
	const fromAppShow = meta.source === 'appShow'
	const isSceneEnter = fromAppShow
		&& (SCAN_LAUNCH_SCENES.indexOf(wxScene) !== -1 || SHARE_LAUNCH_SCENES.indexOf(wxScene) !== -1)

	if (lockOwnStore) {
		if (explicitId && isSceneEnter) {
			// 同一次进入已处理过（例如只是切到后台再回来），不重复覆盖商家已切回的店铺
			const key = entryKeyOf(wxScene, explicitId)
			if (key === appliedEntryKey) {
				return ''
			}
			appliedEntryKey = key
			lockOwnStore = false
			setEntryStoreId(explicitId)
			return explicitId
		}
		return ''
	}
	if (explicitId) {
		if (isSceneEnter) {
			appliedEntryKey = entryKeyOf(wxScene, explicitId)
		}
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

/** 用 getUserInfo 的 lastStoreId / ownedStores / 员工任职店，落到当前经营店 */
export function applyOwnedWorkplace(user) {
	if (!user) return getOwnMerchantStoreId()
	if (Number(user.identityType) === IDENTITY_MERCHANT) {
		const last = normalizeStoreId(user.lastStoreId)
		if (last) {
			return setOwnMerchantStoreId(last)
		}
		const owned = Array.isArray(user.ownedStores) ? user.ownedStores : []
		for (let i = 0; i < owned.length; i++) {
			const id = normalizeStoreId(owned[i] && owned[i].storeId)
			if (id) {
				return setOwnMerchantStoreId(id)
			}
		}
		return getOwnMerchantStoreId()
	}
	if (user.staffStoreId) {
		return setOwnMerchantStoreId(user.staffStoreId)
	}
	return getOwnMerchantStoreId()
}

/** 商家在自己名下分店之间切换：清掉扫码进店，记住当前经营店 */
export function switchOwnedStore(storeId) {
	const next = normalizeStoreId(storeId)
	if (!next) return ''
	entryStoreId = ''
	lockOwnStore = true
	appliedEntryKey = ''
	setOwnMerchantStoreId(next)
	rememberViewStoreId(next)
	return next
}

export function getOwnMerchantStoreId() {
	return ownMerchantStoreId
}

export function isStaffUser(user) {
	return !!normalizeStoreId(user && user.staffStoreId)
}

/** 商家自己的店，或员工任职的店 */
export function getWorkplaceStoreId(user) {
	if (user && Number(user.identityType) === IDENTITY_MERCHANT) {
		return getOwnMerchantStoreId() || normalizeStoreId(user.lastStoreId)
	}
	return normalizeStoreId(user && user.staffStoreId) || getOwnMerchantStoreId()
}

/**
 * 逛店 / 其他业务用的店铺：扫码入参 > 用户 bindStoreId > 本地记住的扫码店 > 项目默认店铺
 * 买断包 lockStoreId=true 时固定本包店铺。
 */
export function resolveViewStoreId(user) {
	if (lockStoreId) {
		return String(defaultBindStoreId)
	}
	if (lockOwnStore) {
		const own = getWorkplaceStoreId(user)
		if (own) return own
	}
	const entry = getEntryStoreId()
	if (entry) return entry
	if (user && Number(user.identityType) === IDENTITY_MERCHANT) {
		const own = getOwnMerchantStoreId() || normalizeStoreId(user.lastStoreId)
		if (own) return own
	}
	const bound = user && user.bindStoreId
	if (!isBlankStoreId(bound)) return normalizeStoreId(bound)
	const remembered = getRememberedStoreId()
	if (remembered) return remembered
	return String(defaultBindStoreId)
}

/** 当前正在逛的店：扫码进店 > 上次浏览。不含「自己的店」兜底，避免误判没在逛别人店。 */
export function getBrowsingStoreId() {
	if (lockStoreId) {
		return String(defaultBindStoreId)
	}
	if (lockOwnStore) {
		return getOwnMerchantStoreId()
	}
	return getEntryStoreId() || getRememberedStoreId()
}

/**
 * 商家/员工扫了别人店的码：其他业务、我的按普通用户界面展示
 */
export function shouldForceOrdinaryUi(user) {
	if (lockStoreId || lockOwnStore) {
		return false
	}
	const workplace = getWorkplaceStoreId(user)
	if (!workplace) return false
	const merchant = user && Number(user.identityType) === IDENTITY_MERCHANT
	if (!merchant && !isStaffUser(user)) {
		return false
	}
	const browsing = getBrowsingStoreId()
	if (!browsing) return false
	return workplace !== browsing
}

/** 当前不在自己店时，展示「切换至我的店铺」 */
export function canSwitchToWorkplace(user) {
	if (lockStoreId) {
		return false
	}
	const workplace = getWorkplaceStoreId(user)
	if (!workplace) return false
	const merchant = user && Number(user.identityType) === IDENTITY_MERCHANT
	if (!merchant && !isStaffUser(user)) {
		return false
	}
	const current = getBrowsingStoreId() || resolveViewStoreId(user)
	return !!current && workplace !== current
}

/** 员工且当前浏览的是任职店铺：显示员工标识和特权 */
export function isStaffAtOwnStore(user) {
	if (!isStaffUser(user) || Number(user.identityType) === IDENTITY_MERCHANT) {
		return false
	}
	if (shouldForceOrdinaryUi(user)) {
		return false
	}
	const workplace = normalizeStoreId(user.staffStoreId)
	const current = resolveViewStoreId(user)
	return !!workplace && !!current && workplace === current
}

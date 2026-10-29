import { getStoreListApi } from '@/common/api/personalCenter/store.js'
import { getOwnMerchantStoreId } from '@/common/storeVisit.js'

/** 小程序展示权限：不落本地缓存，每次进店以接口为准。 */

export const MINIAPP_TYPE_MALL = 1
export const MINIAPP_TYPE_BOOKING = 2

export function mallMiniappUi() {
	return {
		storeId: '',
		miniappType: MINIAPP_TYPE_MALL,
		showStock: true,
		showAddress: true,
		showQuantity: true,
		showCart: true,
		enablePay: true,
		enableRecharge: true,
		orderBtnText: '立即购买',
		homeTabText: '逛店',
		listBtnText: '预定',
		showSaleNum: true,
		showDeliveryFee: true
	}
}

export function bookingMiniappUi() {
	return {
		storeId: '',
		miniappType: MINIAPP_TYPE_BOOKING,
		showStock: false,
		showAddress: false,
		showQuantity: false,
		showCart: false,
		enablePay: true,
		enableRecharge: true,
		orderBtnText: '立即预约',
		homeTabText: '预约',
		listBtnText: '预定',
		showSaleNum: false,
		showDeliveryFee: false
	}
}

function flagOn(value, fallback) {
	if (value === undefined || value === null || value === '') {
		return fallback
	}
	return Number(value) === 1
}

let current = mallMiniappUi()
let ready = false

export function isMiniappUiReady() {
	return ready
}

export function getMiniappUi() {
	return current
}

/** 仅当已拉到店铺配置且明确接入支付时为 true；默认配置不算已接入。 */
export function isStorePayEnabled(ui) {
	const target = ui || current
	if (!ui && !ready) {
		return false
	}
	return target?.enablePay === true
}

/** 是否接入储值：需已拉到配置，且支付与储值同时开启。 */
export function isStoreRechargeEnabled(ui) {
	const target = ui || current
	if (!ui && !ready) {
		return false
	}
	return target?.enablePay !== false && target?.enableRecharge === true
}

/** 按本店最新配置刷新展示权限，避免顾客列表等页用到默认 enablePay=true。 */
export async function syncMerchantMiniappUi(user) {
	const storeId = current?.storeId || getOwnMerchantStoreId() || user?.bindStoreId
	const params = storeId
		? { storeId, pageNum: 1, pageSize: 1 }
		: (user?.id ? { userId: user.id } : null)
	if (!params) {
		return current
	}
	const data = await getStoreListApi(params)
	const list = Array.isArray(data) ? data : (data?.list || [])
	if (list[0]) {
		return applyStoreMiniappUi(list[0])
	}
	return current
}

export function isBookingMiniapp(ui = current) {
	return Number(ui?.miniappType) === MINIAPP_TYPE_BOOKING
}

/** 未接入支付时金额展示 0.00。按当前店铺开关，不按历史免支付渠道。 */
export function shouldZeroOrderAmount(order, ui = current) {
	return (ui || current)?.enablePay === false
}

export function formatOrderPayAmount(amount, order, ui = current) {
	if (shouldZeroOrderAmount(order, ui)) {
		return '0.00'
	}
	return Number(amount || 0).toFixed(2)
}

export function resetMiniappUi() {
	current = mallMiniappUi()
	ready = false
	return current
}

function clipText(value, fallback, max) {
	const text = String(value || '').trim() || fallback
	return text.slice(0, max)
}

let tabBarPendingReveal = false
let tabBarRevealTimer = null

export function hideHomeTabBarUntilReady() {
	tabBarPendingReveal = true
	if (tabBarRevealTimer) {
		clearTimeout(tabBarRevealTimer)
	}
	uni.hideTabBar({
		animation: false,
		fail() {}
	})
	tabBarRevealTimer = setTimeout(() => {
		revealHomeTabBarIfPending()
	}, 8000)
}

function revealHomeTabBarIfPending() {
	if (!tabBarPendingReveal) return
	tabBarPendingReveal = false
	if (tabBarRevealTimer) {
		clearTimeout(tabBarRevealTimer)
		tabBarRevealTimer = null
	}
	uni.showTabBar({
		animation: false,
		fail() {}
	})
}

export function syncHomeTabBar(text) {
	const title = clipText(text, '逛店', 4)
	uni.setTabBarItem({
		index: 0,
		text: title,
		complete: revealHomeTabBarIfPending,
		fail: revealHomeTabBarIfPending
	})
}

export function applyStoreMiniappUi(store) {
	const type = Number(store?.miniappType) === MINIAPP_TYPE_BOOKING
		? MINIAPP_TYPE_BOOKING
		: MINIAPP_TYPE_MALL
	const base = type === MINIAPP_TYPE_BOOKING ? bookingMiniappUi() : mallMiniappUi()
	current = {
		storeId: store?.storeId == null ? '' : String(store.storeId),
		miniappType: type,
		showStock: flagOn(store?.showStock, base.showStock),
		showAddress: flagOn(store?.showAddress, base.showAddress),
		showQuantity: flagOn(store?.showQuantity, base.showQuantity),
		showCart: flagOn(store?.showCart, base.showCart),
		enablePay: flagOn(store?.enablePay, base.enablePay),
		// 储值依附支付：未接入支付时一律关闭
		enableRecharge: flagOn(store?.enablePay, base.enablePay)
			? flagOn(store?.enableRecharge, true)
			: false,
		orderBtnText: clipText(store?.orderBtnText, base.orderBtnText, 16),
		homeTabText: clipText(store?.homeTabText, base.homeTabText, 4),
		listBtnText: clipText(store?.listBtnText, base.listBtnText, 6),
		showSaleNum: flagOn(store?.showSaleNum, base.showSaleNum),
		showDeliveryFee: flagOn(store?.showDeliveryFee, base.showDeliveryFee)
	}
	ready = true
	syncHomeTabBar(current.homeTabText)
	return current
}

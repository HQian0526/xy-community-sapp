import { get } from '../request.js'

/**
 * 本店进行中满减（游客可看）
 * @param {string|number} storeId
 */
export function getActivePromoApi(storeId, options = {}) {
	return get('/mallPromo/active', { storeId }, {
		showError: false,
		...options
	})
}

export function formatMoneyPlain(value) {
	const n = Number(value || 0)
	if (!Number.isFinite(n)) return '0'
	return n.toFixed(2).replace(/\.?0+$/, '')
}

/** 购物车商品金额命中的满减额 */
export function pickPromoDiscount(promo, goodsAmount) {
	const goods = Number(goodsAmount || 0)
	const tiers = Array.isArray(promo?.tiers) ? promo.tiers : []
	let best = 0
	for (const tier of tiers) {
		const threshold = Number(tier?.thresholdAmount || 0)
		const discount = Number(tier?.discountAmount || 0)
		if (goods >= threshold && discount > best) {
			best = discount
		}
	}
	return best
}

export function promoBarText(promo) {
	return String(promo?.tierText || '').trim()
}

export function couponThresholdText(thresholdAmount) {
	const n = Number(thresholdAmount || 0)
	if (!n) return '无门槛'
	return `满${formatMoneyPlain(n)}可用`
}

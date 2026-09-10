import { get, post } from '../request.js'

/**
 * 本店可领优惠券（游客可看；登录后带 claimed）
 * @param {string|number} storeId
 */
export function getStoreCouponTemplatesApi(storeId, options = {}) {
	return get('/mallCoupon/storeTemplates', { storeId }, {
		showError: false,
		...options
	})
}

/**
 * 领取优惠券
 * @param {string|number} templateId
 */
export function receiveCouponApi(templateId) {
	return post('/mallCoupon/receive', { templateId }, {
		loading: true,
		loadingText: '领取中...'
	})
}

/**
 * 我的优惠券
 * @param {Object} [params] tab unused/used/expired、storeId、pageNum、pageSize
 */
export function findMyCouponsApi(params, options = {}) {
	return get('/mallCoupon/myCoupons', params || {}, options)
}

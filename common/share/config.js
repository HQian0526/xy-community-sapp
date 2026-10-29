import {
	getBrowsingStoreId,
	resolveViewStoreId
} from '@/common/storeVisit.js'

/** 商品详情页路径，分享商品时需要与跳转路径保持一致 */
export const PRODUCT_DETAIL_ROUTE = '/pages/mall/productDetail/index'

/** 店铺首页（逛店 tab）路径 */
export const MALL_HOME_ROUTE = '/pages/mall/index'

export const DEFAULT_SHARE = {
	title: '萤小铺 - 您的专属线上小店',
	path: MALL_HOME_ROUTE,
	imageUrl: 'https://file.gzstarfly.com/xy-community/banner.png'
}

/**
 * 当前正在逛的店铺 id：分享非详情页时用它把接收人带到分享者的店铺首页。
 * 买断独立包（lockStoreId）由 resolveViewStoreId 内部固定为本包店铺。
 */
export function currentShareStoreId(user) {
	const browsing = getBrowsingStoreId()
	if (browsing) return browsing
	try {
		return resolveViewStoreId(user) || ''
	} catch (e) {
		return ''
	}
}

export function buildSharePath(route, options = {}) {
	const query = Object.keys(options)
		.filter((key) => options[key] !== undefined && options[key] !== '')
		.map((key) => `${key}=${options[key]}`)
		.join('&')
	const pagePath = route.startsWith('/') ? route : `/${route}`
	return query ? `${pagePath}?${query}` : pagePath
}

export function getCurrentSharePath() {
	const pages = getCurrentPages()
	if (!pages.length) {
		return DEFAULT_SHARE.path
	}
	const page = pages[pages.length - 1]
	return buildSharePath(page.route, page.options || {})
}

/** 非商品详情页分享：视为分享小程序，落到当前店铺首页 */
export function buildStoreHomeSharePath(user) {
	const storeId = currentShareStoreId(user)
	return storeId
		? buildSharePath(MALL_HOME_ROUTE, { storeId })
		: DEFAULT_SHARE.path
}

/**
 * 商品详情页分享：只分享当前商品，并带上所属店铺，
 * 接收人点开直接进入该店的该商品详情。
 *
 * storeId 必传：缺失时后端会按接收人身份兜底查询，导致串店或查不到商品。
 */
export function buildProductShareConfig(product, storeId, fallback) {
	const base = fallback || DEFAULT_SHARE
	if (!product) {
		return {
			title: base.title,
			path: buildStoreHomeSharePath(),
			imageUrl: base.imageUrl
		}
	}
	const pid = product.productId || product.id || ''
	// storeId 必传：页面参数缺失时依次回退商品自带店铺、当前正在逛的店铺，
	// 否则接收人会按自己身份兜底查询，出现串店或查不到商品。
	const sid = storeId || product.storeId || currentShareStoreId()
	const name = String(product.name || '').trim()
	const title = name ? `${name}` : base.title
	// 商品图可能是逗号分隔的多图，取第一张；不是 http(s) 说明调用方未拼全，回退默认图
	const rawImg = String(product.icon || '').split(',')[0].trim()
	const imageUrl = /^https?:\/\//i.test(rawImg) ? rawImg : base.imageUrl
	return {
		title,
		path: buildSharePath(PRODUCT_DETAIL_ROUTE, {
			productId: pid,
			storeId: sid
		}),
		imageUrl
	}
}

export function resolveShareConfig(customConfig = {}) {
	return {
		title: customConfig.title || DEFAULT_SHARE.title,
		path: customConfig.path || buildStoreHomeSharePath(),
		imageUrl: customConfig.imageUrl || DEFAULT_SHARE.imageUrl
	}
}

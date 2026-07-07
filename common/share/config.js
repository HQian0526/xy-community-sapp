export const DEFAULT_SHARE = {
	title: '星萤社区 - 邻里互助，便民生活',
	path: '/pages/order/index',
	imageUrl: 'https://www.gzstarfly.com/xy-community/banner.png'
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

export function resolveShareConfig(customConfig = {}) {
	return {
		title: customConfig.title || DEFAULT_SHARE.title,
		path: customConfig.path || getCurrentSharePath(),
		imageUrl: customConfig.imageUrl || DEFAULT_SHARE.imageUrl
	}
}

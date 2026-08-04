import {
	API_BASE_URL
} from './config.js'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

function buildUrl(url) {
	if (!url) return API_BASE_URL
	if (/^https?:\/\//i.test(url)) return url
	const base = API_BASE_URL.replace(/\/$/, '')
	const path = url.startsWith('/') ? url : `/${url}`
	return `${base}${path}`
}

function getAuthToken() {
	return uni.getStorageSync(TOKEN_KEY) || ''
}

function clearAuthStorage() {
	uni.removeStorageSync(TOKEN_KEY)
	uni.removeStorageSync(USER_INFO_KEY)
}

/**
 * 把 url 中的 {id} 用 params 对应字段替换，并返回剩余参数
 */
function resolvePathParams(url, params) {
	if (!params || typeof params !== 'object') {
		return {
			url,
			data: params
		}
	}

	const rest = {
		...params
	}
	const resolvedUrl = String(url).replace(/\{(\w+)\}/g, (_, key) => {
		if (rest[key] === undefined || rest[key] === null) {
			return `{${key}}`
		}
		const value = rest[key]
		delete rest[key]
		return encodeURIComponent(value)
	})

	return {
		url: resolvedUrl,
		data: rest
	}
}

function getErrorMessage(body, statusCode) {
	if (typeof body === 'string' && body.trim()) {
		return body
	}
	if (!body || typeof body !== 'object') {
		return statusCode ? `请求失败(${statusCode})` : '网络异常，请稍后重试'
	}
	return body.msg || body.message || body.error || (statusCode ? `请求失败(${statusCode})` :
		'请求失败')
}

function toastError(message) {
	uni.showToast({
		title: message || '请求失败',
		icon: 'none'
	})
}

function reLoginAfterUnauthorized() {
	// 动态引入，避免与 auth.js 的静态循环依赖
	return import('@/common/auth.js').then((auth) => {
		if (typeof auth.wxLogin === 'function') {
			return auth.wxLogin()
		}
		throw new Error('登录模块不可用')
	})
}

/**
 * 统一请求封装
 * @param {Object} options
 * @param {string} options.url 相对路径（如 /wx/login）或完整 URL，支持 /xxx/{id}
 * @param {string} [options.method='GET']
 * @param {Object} [options.data] 请求体 / 查询参数 / 路径参数
 * @param {Object} [options.header]
 * @param {boolean} [options.auth=true] 是否自动带 Authorization
 * @param {boolean} [options.showError=true] 失败时是否自动 toast
 * @param {boolean} [options.loading=false] 是否显示 loading
 * @param {string} [options.loadingText='加载中...']
 * @returns {Promise<any>} 成功时返回业务 data（Response.data）
 */
export function request(options = {}) {
	const {
		url,
		method = 'GET',
		data,
		header = {},
		auth = true,
		showError = true,
		loading = false,
		loadingText = '加载中...',
		__retried = false
	} = options

	const {
		url: resolvedUrl,
		data: payload
	} = resolvePathParams(url, data)

	const headers = {
		'Content-Type': 'application/json',
		...header
	}

	if (auth) {
		const token = getAuthToken()
		if (token) {
			headers.Authorization = `Bearer ${token}`
		}
	}

	const upperMethod = String(method || 'GET').toUpperCase()

	if (loading) {
		uni.showLoading({
			title: loadingText,
			mask: true
		})
	}

	return new Promise((resolve, reject) => {
		uni.request({
			url: buildUrl(resolvedUrl),
			method: upperMethod,
			data: payload,
			header: headers,
			success: (res) => {
				const body = res.data || {}
				const statusCode = res.statusCode

				if (statusCode === 401) {
					clearAuthStorage()
					// 需鉴权的接口：清 token 后自动重登并重试一次（解决首进页 token 未就绪/过期）
					if (auth && !__retried) {
						reLoginAfterUnauthorized()
							.then(() => request({
								...options,
								__retried: true,
								loading: false
							}))
							.then(resolve)
							.catch((error) => {
								const message = getErrorMessage(body, statusCode) || '登录已过期，请重新登录'
								if (showError) toastError(message)
								reject(error instanceof Error ? error : new Error(message))
							})
						return
					}
					const message = getErrorMessage(body, statusCode) || '登录已过期，请重新登录'
					if (showError) toastError(message)
					reject(new Error(message))
					return
				}

				if (statusCode >= 400) {
					const message = getErrorMessage(body, statusCode)
					if (showError) toastError(message)
					reject(new Error(message))
					return
				}

				if (body.code !== undefined && body.code !== 200) {
					const message = getErrorMessage(body)
					if (showError) toastError(message)
					reject(new Error(message))
					return
				}

				resolve(body.data !== undefined ? body.data : body)
			},
			fail: (err) => {
				const message = err?.errMsg || '网络异常，请稍后重试'
				if (showError) toastError(message)
				reject(err instanceof Error ? err : new Error(message))
			},
			complete: () => {
				if (loading) {
					uni.hideLoading()
				}
			}
		})
	})
}

export function get(url, data, options = {}) {
	return request({
		url,
		method: 'GET',
		data,
		...options
	})
}

export function post(url, data, options = {}) {
	return request({
		url,
		method: 'POST',
		data,
		...options
	})
}

export function put(url, data, options = {}) {
	return request({
		url,
		method: 'PUT',
		data,
		...options
	})
}

export function del(url, data, options = {}) {
	return request({
		url,
		method: 'DELETE',
		data,
		...options
	})
}

export const http = {
	request,
	get,
	post,
	put,
	delete: del
}

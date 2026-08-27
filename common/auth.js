import {
	wxLoginApi,
	wxBindPhoneApi
} from '@/common/api/wx.js'
import {
	get,
	put
} from '@/common/api/request.js'
import {
	bindStoreId as defaultBindStoreId
} from '@/config/index.js'
import {
	getBindPhoneUI,
	registerBindPhoneHandlers,
	registerBindPhoneUI,
	unregisterBindPhoneUI
} from '@/common/bindPhoneUi.js'

export {
	registerBindPhoneUI,
	unregisterBindPhoneUI
}

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

let loginPromise = null
/** 用户主动拒绝登录后，非 force 的闸门不再强登 */
let loginDeclined = false
/** 启动静默登录完成态，供首页等待，避免业务接口抢跑 */
let bootstrapPromise = null
let bootstrapDone = false
/** 本次启动是否已成功拉取过 /user/getUserInfo */
let userInfoFetched = false
/** 进行中的 getUserInfo 请求，供多页面并发复用 */
let userInfoPromise = null

export function isLoggedIn() {
	return !!uni.getStorageSync(TOKEN_KEY)
}

export function getToken() {
	return uni.getStorageSync(TOKEN_KEY) || ''
}

export function getUserInfo() {
	return uni.getStorageSync(USER_INFO_KEY) || null
}

function normalizeUserInfo(user) {
	if (!user || typeof user !== 'object') return null
	return {
		...user,
		needBindPhone: user.needBindPhone === true || (user.needBindPhone !== false && !user.phone)
	}
}

export function saveLoginInfo(token, userInfo) {
	if (token) {
		uni.setStorageSync(TOKEN_KEY, token)
	}
	if (userInfo) {
		uni.setStorageSync(USER_INFO_KEY, normalizeUserInfo(userInfo) || userInfo)
	}
}

export function clearLoginInfo() {
	uni.removeStorageSync(TOKEN_KEY)
	uni.removeStorageSync(USER_INFO_KEY)
	userInfoFetched = false
	userInfoPromise = null
}

function isBindStoreIdEmpty(value) {
	return value === undefined || value === null || String(value).trim() === ''
}

function isOrdinaryUser(user) {
	if (user == null || user.identityType == null) {
		return true
	}
	return Number(user.identityType) === 1
}

/**
 * 普通用户未绑定店铺时，用配置默认店铺回写 updateUser，并写入本地缓存
 */
async function persistDefaultBindStore(user) {
	if (!user || !isOrdinaryUser(user) || !isBindStoreIdEmpty(user.bindStoreId)) {
		return user
	}
	try {
		if (user.id) {
			await put('/user/updateUser', {
				id: user.id,
				bindStoreId: defaultBindStoreId
			})
		}
	} catch (error) {
		console.warn('回写默认绑定店铺失败', error)
	}
	const next = {
		...user,
		bindStoreId: defaultBindStoreId
	}
	saveLoginInfo(getToken(), next)
	return next
}

/**
 * 启动后只请求一次 getUserInfo，之后各页读缓存。
 * 若 bindStoreId 为空，会把配置的默认店铺写入后端并同步缓存。
 * @param {{ force?: boolean }} [options]
 */
export async function ensureUserInfo(options = {}) {
	const force = !!options.force
	if (!isLoggedIn()) {
		return null
	}
	if (!force && userInfoFetched) {
		const cached = getUserInfo()
		if (cached) {
			return cached
		}
		userInfoFetched = false
	}
	if (!force && userInfoPromise) {
		return userInfoPromise
	}

	userInfoPromise = (async () => {
		try {
			const user = await get('/user/getUserInfo')
			if (user) {
				saveLoginInfo(getToken(), user)
			}
			const cached = await persistDefaultBindStore(getUserInfo() || user)
			userInfoFetched = true
			return cached || getUserInfo()
		} catch (error) {
			console.error('获取用户信息失败', error)
			const cached = getUserInfo()
			if (cached) {
				userInfoFetched = true
				return persistDefaultBindStore(cached)
			}
			return null
		} finally {
			userInfoPromise = null
		}
	})()
	return userInfoPromise
}

export function isNeedBindPhone(userInfo = getUserInfo()) {
	if (!userInfo) return false
	if (userInfo.needBindPhone === true) return true
	if (userInfo.needBindPhone === false) return false
	return !userInfo.phone
}

/**
 * 用 getPhoneNumber 的 code 绑定手机号并合并账号
 */
export async function bindPhoneByCode(code) {
	if (!code) {
		throw new Error('手机号授权 code 不能为空')
	}
	const data = await wxBindPhoneApi(code) || {}
	const token = data.token || data.accessToken
	const userInfo = data.userInfo || null
	saveLoginInfo(token, userInfo)
	if (userInfo) {
		userInfoFetched = true
	}
	const cached = await persistDefaultBindStore(getUserInfo() || userInfo)
	return {
		...data,
		token,
		userInfo: cached || getUserInfo() || userInfo,
		merged: !!data.merged
	}
}

/**
 * 若当前用户缺少手机号，弹出授权层并等待结果。
 * @param {{ required?: boolean }} [options] required 时不可关闭，必须授权才算成功
 */
export async function ensurePhoneBound(options = {}) {
	const required = options.required === true
	if (!isNeedBindPhone()) {
		return {
			skipped: false,
			bound: true,
			userInfo: getUserInfo()
		}
	}
	const bindPhoneUI = getBindPhoneUI()
	if (!bindPhoneUI || typeof bindPhoneUI.show !== 'function') {
		console.warn('手机号绑定弹窗未挂载，跳过授权')
		return {
			skipped: true,
			bound: false,
			userInfo: getUserInfo()
		}
	}
	const result = await bindPhoneUI.show({
		required
	})
	const bound = !isNeedBindPhone()
	return {
		skipped: !!result?.skipped || !bound,
		bound,
		userInfo: result?.userInfo || getUserInfo()
	}
}

function doWxLogin() {
	return new Promise((resolve, reject) => {
		const loginOptions = {
			success: async (loginRes) => {
				if (!loginRes.code) {
					reject(new Error('获取微信登录凭证失败'))
					return
				}
				try {
					const payload = await wxLoginApi(loginRes.code) || {}
					const token = payload.token || payload.accessToken
					const userInfo = payload.userInfo || payload.user || null
					if (!token) {
						reject(new Error('登录响应缺少 token'))
						return
					}
					const result = {
						token,
						userInfo,
						merged: !!payload.merged
					}
					saveLoginInfo(token, userInfo)
					resolve(result)
				} catch (error) {
					reject(error)
				}
			},
			fail: (err) => {
				reject(err)
			}
		}

		// #ifdef MP-WEIXIN
		uni.login(loginOptions)
		// #endif

		// #ifndef MP-WEIXIN
		uni.login({
			...loginOptions,
			provider: 'weixin'
		})
		// #endif
	})
}

export function wxLogin() {
	if (!loginPromise) {
		loginPromise = doWxLogin().finally(() => {
			loginPromise = null
		})
	}
	return loginPromise
}

/**
 * 等待进行中的登录换票结束（不二次触发 bootstrap，避免死等）
 */
export async function waitLoginReady() {
	if (loginPromise) {
		try {
			await loginPromise
		} catch (_) {
			// 登录失败由调用方/引导流程处理，这里只负责排队
		}
	}
}

export function ensureLogin() {
	if (isLoggedIn()) {
		return Promise.resolve({
			token: getToken(),
			userInfo: getUserInfo()
		})
	}
	return wxLogin()
}

export function isLoginDeclined() {
	return loginDeclined && !isLoggedIn()
}

export function clearLoginDeclined() {
	loginDeclined = false
}

/**
 * 应用启动：只做静默 uni.login 换票，不弹登录/手机号授权窗。
 * 失败则清本地登录态，首页按游客浏览。
 */
export function bootstrapAuth() {
	if (bootstrapPromise) {
		return bootstrapPromise
	}
	bootstrapPromise = (async () => {
		try {
			const result = await wxLogin()
			loginDeclined = false
			await ensureUserInfo()
			return result
		} catch (error) {
			console.warn('启动静默登录失败，按游客浏览', error)
			clearLoginInfo()
			return null
		} finally {
			bootstrapDone = true
		}
	})()
	return bootstrapPromise
}

/** 等待启动静默登录结束（已完成则立刻返回） */
export function waitBootstrapAuth() {
	if (bootstrapDone) {
		return Promise.resolve()
	}
	if (bootstrapPromise) {
		return bootstrapPromise.then(() => undefined).catch(() => undefined)
	}
	return bootstrapAuth().then(() => undefined).catch(() => undefined)
}

/**
 * 登录闸门：用户主动操作时再调。默认不弹手机号授权。
 * @param {{ force?: boolean, bindPhone?: boolean }} [options]
 * @returns {Promise<boolean>}
 */
export async function requireLogin(options = {}) {
	const force = !!options.force
	const bindPhone = options.bindPhone === true
	try {
		if (!force && isLoginDeclined()) {
			return false
		}
		if (force) {
			clearLoginDeclined()
		}
		// 若启动换票仍在进行，先等它结束，避免业务接口抢跑
		await waitLoginReady()
		await ensureLogin()
		if (!getToken()) {
			await wxLogin()
		}
		if (!getToken()) {
			throw new Error('登录失败，未获取到 token')
		}
		loginDeclined = false
		await ensureUserInfo()
		// 绑手机号弹窗改为异步，避免卡住分类/商品列表请求
		if (bindPhone) {
			ensurePhoneBound().catch((error) => {
				console.warn('手机号绑定引导失败', error)
			})
		}
		return true
	} catch (error) {
		console.error('微信登录失败', error)
		uni.showToast({
			title: error?.message || '登录失败，请稍后重试',
			icon: 'none'
		})
		return false
	}
}

registerBindPhoneHandlers({
	isNeedBindPhone,
	bindPhoneByCode
})


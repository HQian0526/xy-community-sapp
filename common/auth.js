import {
	wxLoginApi,
	wxBindPhoneApi
} from '@/common/api/wx.js'

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

let loginPromise = null
let bindPhoneUI = null

export function isLoggedIn() {
	return !!uni.getStorageSync(TOKEN_KEY)
}

export function getToken() {
	return uni.getStorageSync(TOKEN_KEY) || ''
}

export function getUserInfo() {
	return uni.getStorageSync(USER_INFO_KEY) || null
}

export function saveLoginInfo(token, userInfo) {
	if (token) {
		uni.setStorageSync(TOKEN_KEY, token)
	}
	if (userInfo) {
		uni.setStorageSync(USER_INFO_KEY, userInfo)
	}
}

export function clearLoginInfo() {
	uni.removeStorageSync(TOKEN_KEY)
	uni.removeStorageSync(USER_INFO_KEY)
}

export function isNeedBindPhone(userInfo = getUserInfo()) {
	if (!userInfo) return false
	if (userInfo.needBindPhone === true) return true
	if (userInfo.needBindPhone === false) return false
	return !userInfo.phone
}

/** 由 bind-phone-popup 组件挂载时注册，供全局弹出 */
export function registerBindPhoneUI(ui) {
	bindPhoneUI = ui
}

export function unregisterBindPhoneUI(ui) {
	if (!ui || bindPhoneUI === ui) {
		bindPhoneUI = null
	}
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
	return {
		...data,
		token,
		userInfo,
		merged: !!data.merged
	}
}

/**
 * 若当前用户缺少手机号，弹出授权层等待用户操作
 * 用户点「稍后再说」时以 skipped: true 结束，不阻断主流程
 */
export async function ensurePhoneBound() {
	if (!isNeedBindPhone()) {
		return {
			skipped: false,
			userInfo: getUserInfo()
		}
	}
	if (!bindPhoneUI || typeof bindPhoneUI.show !== 'function') {
		console.warn('手机号绑定弹窗未挂载，跳过授权')
		return {
			skipped: true,
			userInfo: getUserInfo()
		}
	}
	return bindPhoneUI.show()
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

export function ensureLogin() {
	if (isLoggedIn()) {
		return Promise.resolve({
			token: getToken(),
			userInfo: getUserInfo()
		})
	}
	return wxLogin()
}

/** 应用启动时预登录，避免首页首屏接口早于登录完成 */
export function bootstrapAuth() {
	return ensureLogin().catch((error) => {
		console.warn('启动预登录失败', error)
		return null
	})
}

/**
 * 登录闸门：先确保已登录，再按需引导绑定手机号（用于账号合并）
 * @returns {Promise<boolean>}
 */
export async function requireLogin() {
	try {
		await ensureLogin()
		if (!getToken()) {
			await wxLogin()
		}
		await ensurePhoneBound()
		if (!getToken()) {
			throw new Error('登录失败，未获取到 token')
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

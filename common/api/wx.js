import {
	post
} from './request.js'

function getMiniProgramAppId() {
	try {
		const account =
			typeof wx !== 'undefined' && typeof wx.getAccountInfoSync === 'function'
				? wx.getAccountInfoSync()
				: typeof uni !== 'undefined' && typeof uni.getAccountInfoSync === 'function'
					? uni.getAccountInfoSync()
					: null
		return account?.miniProgram?.appId || ''
	} catch (e) {
		return ''
	}
}

/**
 * 微信小程序登录：用 uni.login 拿到的 code 换系统 JWT
 * @param {string} code
 */
export function wxLoginApi(code) {
	const appId = getMiniProgramAppId()
	const payload = {
		code
	}
	if (appId) {
		payload.appId = appId
	}
	return post('/wx/login', payload, {
		auth: false,
		showError: false
	})
}

/**
 * 绑定微信手机号：用 getPhoneNumber 返回的 code
 * 若手机号已有后台账号，会合并并返回新 token
 * @param {string} code
 */
export function wxBindPhoneApi(code) {
	return post('/wx/bindPhone', {
		code
	})
}

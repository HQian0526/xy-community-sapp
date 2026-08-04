import {
	post
} from './request.js'

/**
 * 微信小程序登录：用 uni.login 拿到的 code 换系统 JWT
 * @param {string} code
 */
export function wxLoginApi(code) {
	return post('/wx/login', {
		code
	}, {
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

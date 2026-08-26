/** 手机号绑定弹窗的轻量桥接，组件不要直接依赖 auth.js，避免微信端循环引用 */

let bindPhoneUI = null
let isNeedBindPhoneImpl = null
let bindPhoneByCodeImpl = null

export function registerBindPhoneUI(ui) {
	bindPhoneUI = ui
}

export function unregisterBindPhoneUI(ui) {
	if (!ui || bindPhoneUI === ui) {
		bindPhoneUI = null
	}
}

export function getBindPhoneUI() {
	return bindPhoneUI
}

export function registerBindPhoneHandlers(handlers = {}) {
	if (typeof handlers.isNeedBindPhone === 'function') {
		isNeedBindPhoneImpl = handlers.isNeedBindPhone
	}
	if (typeof handlers.bindPhoneByCode === 'function') {
		bindPhoneByCodeImpl = handlers.bindPhoneByCode
	}
}

export function isNeedBindPhone() {
	if (typeof isNeedBindPhoneImpl !== 'function') {
		return false
	}
	return isNeedBindPhoneImpl()
}

export function bindPhoneByCode(code) {
	if (typeof bindPhoneByCodeImpl !== 'function') {
		return Promise.reject(new Error('登录模块未就绪'))
	}
	return bindPhoneByCodeImpl(code)
}

import { storeInfo } from '../mock.js'

export const STORE_PROFILE_KEY = 'storeProfile'

export function getDefaultStoreProfile() {
	return {
		storeName: storeInfo.storeName,
		phone: storeInfo.phone,
		storePhoto: storeInfo.avatar
	}
}

export function getStoreProfile() {
	const cached = uni.getStorageSync(STORE_PROFILE_KEY)
	const defaults = getDefaultStoreProfile()
	return cached ? { ...defaults, ...cached } : defaults
}

export function setStoreProfile(data) {
	uni.setStorageSync(STORE_PROFILE_KEY, data)
}

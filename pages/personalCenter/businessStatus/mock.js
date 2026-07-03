export const STATUS_OPEN = '营业中'
export const STATUS_CLOSED = '暂停营业'

export const DEFAULT_STATUS = STATUS_OPEN

export const STORAGE_KEY = 'businessStatus'

export function getBusinessStatus() {
	const cached = uni.getStorageSync(STORAGE_KEY)
	return cached || DEFAULT_STATUS
}

export function setBusinessStatus(status) {
	uni.setStorageSync(STORAGE_KEY, status)
}

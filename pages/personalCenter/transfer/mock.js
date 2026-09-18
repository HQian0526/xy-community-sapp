const TRANSFER_STORAGE_KEY = 'storeTransferList'

export const MIN_TRANSFER_FEE = 800
export const TRANSFER_HANDLING_FEE = 800
export const BIND_REGION = '地址'

export function saveStoreTransfer(data) {
	const list = uni.getStorageSync(TRANSFER_STORAGE_KEY) || []
	list.unshift({
		...data,
		id: Date.now().toString(),
		createTime: new Date().toLocaleString()
	})
	uni.setStorageSync(TRANSFER_STORAGE_KEY, list)
}

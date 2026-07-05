const JOIN_APPLY_KEY = 'joinApplyList'

export const JOIN_FEE = 3998

export function saveJoinApplication(data) {
	const list = uni.getStorageSync(JOIN_APPLY_KEY) || []
	list.unshift({
		...data,
		id: Date.now().toString(),
		createTime: new Date().toLocaleString()
	})
	uni.setStorageSync(JOIN_APPLY_KEY, list)
}

export const PENDING_STORAGE_KEY = 'pendingTasks'

export function getPendingTasks() {
	const cached = uni.getStorageSync(PENDING_STORAGE_KEY)
	return cached && cached.length ? cached : []
}

export function setPendingTasks(list) {
	uni.setStorageSync(PENDING_STORAGE_KEY, list)
}

export function completePendingTask(id) {
	const list = getPendingTasks().filter(item => item.id !== id)
	setPendingTasks(list)
	return list
}

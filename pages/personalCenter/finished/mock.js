export const FINISHED_STORAGE_KEY = 'finishedTasks'

function formatNow() {
	const date = new Date()
	const pad = (n) => String(n).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function getFinishedTasks() {
	const cached = uni.getStorageSync(FINISHED_STORAGE_KEY)
	return Array.isArray(cached) ? cached : []
}

export function setFinishedTasks(list) {
	uni.setStorageSync(FINISHED_STORAGE_KEY, list)
}

export function addFinishedTask(task, extra = {}) {
	if (!task) return getFinishedTasks()
	const list = getFinishedTasks().filter(item => item.id !== task.id)
	const finishedItem = {
		...task,
		status: '已完成',
		statusType: 'finished',
		completeTime: formatNow(),
		...extra
	}
	setFinishedTasks([finishedItem, ...list])
	return getFinishedTasks()
}

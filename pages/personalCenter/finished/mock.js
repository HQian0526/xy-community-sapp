export const FINISHED_STORAGE_KEY = 'finishedTasks'

export const finishedTaskList = [
	{
		id: '101',
		companyName: '帮忙遛狗30分钟',
		status: '已完成',
		statusType: 'finished',
		faultType: '其他',
		submitTime: '2025-08-20 08:30:00',
		completeTime: '2025-08-20 09:15:22',
		description: '在小区遛一圈即可，狗狗很乖',
		orderCode: '8651039100182298601',
		phone: '13900139000',
		address: '上海-汤臣一品 1栋1单元101',
		price: 20
	},
	{
		id: '102',
		companyName: '代收一个快递',
		status: '已完成',
		statusType: 'finished',
		faultType: '取件',
		submitTime: '2025-08-18 14:20:00',
		completeTime: '2025-08-18 16:05:18',
		description: '菜鸟驿站取件，送到前台即可',
		orderCode: '8651039100182298602',
		phone: '13710088789',
		address: '上海-汤臣一品 6栋2单元602',
		price: 3,
		startCode: '882736'
	},
	{
		id: '103',
		companyName: '帮忙搬一个箱子',
		status: '已完成',
		statusType: 'finished',
		faultType: '其他',
		submitTime: '2025-08-15 11:00:00',
		completeTime: '2025-08-15 11:45:30',
		description: '从地下车库搬到12楼，有电梯',
		orderCode: '8651039100182298603',
		phone: '13600136000',
		address: '上海-汤臣一品 12栋1单元1201',
		price: 30
	}
]

function formatNow() {
	const date = new Date()
	const pad = (n) => String(n).padStart(2, '0')
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function getFinishedTasks() {
	const cached = uni.getStorageSync(FINISHED_STORAGE_KEY)
	return cached && cached.length ? cached : [...finishedTaskList]
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

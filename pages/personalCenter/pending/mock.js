import { filterStoreOrders, getStoreOrders } from '../storeOrder/mock.js'

export const PENDING_STORAGE_KEY = 'pendingTasks'

export const pendingTaskList = [
	{
		id: '1',
		companyName: '帮拿快递',
		status: '进行中',
		statusType: 'processing',
		faultType: '取件',
		submitTime: '2025-09-02 10:12:27',
		description: '去驿站取，放到家门口的鞋柜上',
		orderCode: '8651039100182298624',
		phone: '13710088789',
		address: '上海-汤臣一品 3栋2单元801',
		price: 2,
		startCode: '981729'
	},
	{
		id: '3',
		companyName: '有会修洗衣机的吗',
		status: '进行中',
		statusType: 'processing',
		faultType: '维修',
		submitTime: '2025-09-01 15:30:00',
		description: '洗衣机脱水时有异响，需要上门检修',
		orderCode: '8651039100182298626',
		phone: '13710088789',
		address: '上海-汤臣一品 5栋1单元1203',
		price: 100,
		startCode: '562831'
	},
	{
		id: '2',
		companyName: '逛商场的帮忙带瓶花生油',
		status: '进行中',
		statusType: 'processing',
		faultType: '代购',
		submitTime: '2025-09-02 09:20:15',
		description: '任意超市商场都行，主要是我懒',
		orderCode: '8651039100182298625',
		phone: '13800138000',
		address: '上海-汤臣一品 2栋3单元502',
		price: 5,
		startCode: '334521'
	}
]

export function getPendingTasks() {
	const cached = uni.getStorageSync(PENDING_STORAGE_KEY)
	return cached && cached.length ? cached : [...pendingTaskList]
}

export function setPendingTasks(list) {
	uni.setStorageSync(PENDING_STORAGE_KEY, list)
}

export function getPendingCount() {
	return filterStoreOrders(getStoreOrders(), 'pending').length
}

export function completePendingTask(id) {
	const list = getPendingTasks().filter(item => item.id !== id)
	setPendingTasks(list)
	return list
}
